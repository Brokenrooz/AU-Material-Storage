from gw2_client import GW2Client
from materials import build_material_rows
from table import format_material_table

def chunked(iterable, size):
    for i in range(0, len(iterable), size):
        yield iterable[i:i + size]
        
def main():
    print("Gw2 backend alive. I guess.")

    api_key = input("Paste your shit: ").strip()
    client = GW2Client(api_key)

    materials = client.get("account/materials")
    print(f"Loaded {len(materials)} material entries.")

    item_ids = [m["id"] for m in materials]

    all_items = []

    for batch in chunked(item_ids, 200):
        batch_ids = ",".join(map(str, batch))
        items = client.get("items", params={"ids": batch_ids})
        all_items.extend(items)

    print(f"Resolved {len(all_items)} item definitions.")

    item_lookup = {item["id"]: item for item in all_items}

    rows = build_material_rows(materials, item_lookup)

    table = format_material_table(rows)
    print(table)

if __name__ == "__main__":
    main()