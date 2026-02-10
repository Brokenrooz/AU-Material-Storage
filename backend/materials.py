def build_material_rows(materials, item_lookup):
    rows = []

    for mat in materials:
        item_id = mat["id"]
        quantity = mat["count"]

        item = item_lookup.get(item_id, {})
        name = item.get("name", f"Unknown ({item_id})")

        rows.append({
            "id": item_id,
            "name": name,
            "quantity": quantity
        })
    return rows