def format_material_table(rows):
    rows = sorted(rows, key=lambda r: r["quantity"], reverse=True)

    id_width = max(len(str(r["id"])) for r in rows)
    name_width = max(len(r["name"]) for r in rows)
    qty_width = max(len(str(r["quantity"])) for r in rows)

    header = (
        f"{'ID'.ljust(id_width)} "
        f"{'NAME'.ljust(name_width)} "
        f"{'QTY'.rjust(qty_width)}"
    )

    separator = "-" * len(header)

    lines = [header, separator]

    total_quantity = 0

    for r in rows:
        total_quantity += r["quantity"]
        line = (
            f"{str(r["id"]).ljust(id_width)} "
            f"{r['name'].ljust(name_width)} "
            f"{str(r['quantity']).rjust(qty_width)}"
        )
        lines.append(line)
    
    lines.append(separator)
    lines.append(f"TOTAL MATERIAL TYPES: {len(rows)}")
    lines.append(f"TOTAL QUANTITY:  {total_quantity:,}")

    return "\n".join(lines)
