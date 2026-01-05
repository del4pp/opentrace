import json

def translate_dsl_to_sql(rid, dsl_dict):
    """
    Translates the Segment JSON DSL into a ClickHouse HAVING clause or 
    a complex subquery structure.
    """
    logic = dsl_dict.get("logic", "AND")
    conditions = dsl_dict.get("conditions", [])
    
    # We will build parts of the HAVING clause
    having_parts = []
    
    for cond in conditions:
        if cond.get("logic"):
            # Nested logic
            part = translate_dsl_to_sql(rid, cond)
            having_parts.append(f"({part})")
            continue
            
        c_type = cond.get("type")
        if c_type == "property":
            field = cond.get("field")
            op = cond.get("operator")
            val = cond.get("value")
            
            # Map frontend fields to ClickHouse columns
            field_map = {
                "source": "utm_source",
                "country": "lang", # proxy
                "device": "user_agent" # proxy or simplified
            }
            ch_field = field_map.get(field, field)
            
            if op == "=":
                having_parts.append(f"any({ch_field}) = '{val}'")
            elif op == "!=":
                having_parts.append(f"any({ch_field}) != '{val}'")
            elif op == "IN":
                vals = "', '".join(val) if isinstance(val, list) else val
                having_parts.append(f"any({ch_field}) IN ('{vals}')")
                
        elif c_type == "event":
            event = cond.get("event")
            op = cond.get("operator") # HAPPENED, NOT_HAPPENED
            count = cond.get("count", 1)
            within_days = cond.get("within_days")
            
            cond_str = f"event_type = '{event}'"
            if within_days:
                # This requires calculating time diff from first event in the group
                # For simplicity in MVP, we calculate within_days from 'Day 0' relative to first event
                cond_str += f" AND toDate(timestamp) <= min(toDate(timestamp)) + {within_days}"
            
            if op == "HAPPENED":
                having_parts.append(f"countIf({cond_str}) >= {count}")
            elif op == "NOT_HAPPENED":
                having_parts.append(f"countIf({cond_str}) = 0")
                
    if not having_parts:
        return "1=1"
        
    return f" {logic} ".join(having_parts)

def generate_segment_query(rid, dsl_dict, limit=1000):
    having_clause = translate_dsl_to_sql(rid, dsl_dict)
    
    query = f"""
    SELECT 
        session_id as identity
    FROM telemetry
    WHERE resource_id = '{rid}'
    GROUP BY identity
    HAVING {having_clause}
    LIMIT {limit}
    """
    return query

def generate_segment_count_query(rid, dsl_dict):
    having_clause = translate_dsl_to_sql(rid, dsl_dict)
    
    query = f"""
    SELECT count() FROM (
        SELECT 
            session_id
        FROM telemetry
        WHERE resource_id = '{rid}'
        GROUP BY session_id
        HAVING {having_clause}
    )
    """
    return query
