import pandas as pd
import json
import os
from sentence_transformers import SentenceTransformer

# Load the dataset
csv_path = 'data/gc-ai-register-mvp-registre-de-lia-du-gc-pmv.csv'
df = pd.read_csv(csv_path)

# Initialize the model for embeddings
# 'all-MiniLM-L6-v2' is a good balance of speed and quality for this use case
model = SentenceTransformer('all-MiniLM-L6-v2')

def process_language(lang_code):
    """
    Process data for a specific language (en or fr).
    """
    suffix = f'_{lang_code}'
    
    # Select columns for this language
    cols = {
        'ai_register_id': 'id',
        f'name_ai_system{suffix}': 'name',
        'government_organization': 'department',
        f'description_ai_system{suffix}': 'description',
        f'ai_system_primary_users{suffix}': 'users',
        f'developed_by{suffix}': 'developed_by',
        'vendor_information': 'vendor',
        f'ai_system_status{suffix}': 'status',
        'status_date': 'status_date',
        f'ai_system_capabilities{suffix}': 'capabilities',
        f'data_sources{suffix}': 'data_sources',
        'involves_personal_information': 'pii',
        f'personal_information_banks{suffix}': 'pii_banks',
        'notification_ai': 'notification_ai',
        f'ai_system_results{suffix}': 'results'
    }
    
    # Filter and rename columns
    # Ensure all columns exist, fill with empty string if missing
    for col in cols.keys():
        if col not in df.columns:
            df[col] = ''
            
    data = df[cols.keys()].rename(columns=cols)
    
    # Clean up department names
    # The CSV has "English Name / Nom français" format. 
    # We need to split it.
    def clean_dept(val):
        if not isinstance(val, str): return ""
        parts = val.split(' / ')
        if len(parts) == 2:
            return parts[0] if lang_code == 'en' else parts[1]
        return val

    data['department'] = data['department'].apply(clean_dept)
    
    # Clean up ALL string fields: strip whitespace and normalize capitalization
    def clean_string(val):
        if not isinstance(val, str): return ""
        return val.strip()
    
    # Clean up status field specifically - normalize capitalization
    def clean_status(val):
        if not isinstance(val, str): return ""
        val = val.strip()
        # Normalize common status values
        val_lower = val.lower()
        if val_lower == 'in production':
            return 'In production' if lang_code == 'en' else 'En production'
        elif val_lower == 'en production':
            return 'En production'
        elif val_lower == 'in development':
            return 'In development' if lang_code == 'en' else 'En cours de développement'
        elif val_lower in ['en cours de développement', 'en développement']:
            return 'En cours de développement'
        elif val_lower == 'retired':
            return 'Retired' if lang_code == 'en' else 'Mis hors service'
        elif val_lower == 'mis hors service':
            return 'Mis hors service'
        return val
    
    # Clean up developed_by to consolidate "Other" and strip whitespace
    def clean_developed_by(val):
        if not isinstance(val, str): return ""
        val = val.strip()  # Remove trailing/leading whitespace
        # Consolidate "Other" entries
        if val.lower() in ['other', 'autre', 'other / autre']:
            return 'Other' if lang_code == 'en' else 'Autre'
        return val

    # Apply cleaning to all relevant fields
    for col in ['name', 'description', 'users', 'vendor', 'capabilities', 
                'data_sources', 'pii_banks', 'results']:
        if col in data.columns:
            data[col] = data[col].apply(clean_string)
    
    data['status'] = data['status'].apply(clean_status)
    data['developed_by'] = data['developed_by'].apply(clean_developed_by)

    # Fill NA
    data = data.fillna('')
    
    # Create a text field for embedding
    # We combine ALL relevant fields for semantic search
    data['search_text'] = (
        data['name'] + " " + 
        data['department'] + " " + 
        data['description'] + " " + 
        data['capabilities'] + " " +
        data['users'] + " " +
        data['developed_by'] + " " +
        data['vendor'] + " " +
        data['status'] + " " +
        data['pii_banks'] + " " +
        data['results']
    )
    
    print(f"Generating embeddings for {lang_code}...")
    embeddings = model.encode(data['search_text'].tolist())
    
    # Convert to list of records
    records = data.to_dict(orient='records')
    
    # Add embeddings to records (as simple lists for JSON serialization)
    for i, record in enumerate(records):
        record['embedding'] = embeddings[i].tolist()
        # Remove search_text to save space, we don't need to display it
        del record['search_text']
        
    return records

# Ensure output directory exists
os.makedirs('public', exist_ok=True)

# Process English
print("Processing English data...")
data_en = process_language('en')
with open('public/data_en.json', 'w', encoding='utf-8') as f:
    json.dump(data_en, f, ensure_ascii=False)

# Process French
print("Processing French data...")
data_fr = process_language('fr')
with open('public/data_fr.json', 'w', encoding='utf-8') as f:
    json.dump(data_fr, f, ensure_ascii=False)

print("Data processing complete.")
