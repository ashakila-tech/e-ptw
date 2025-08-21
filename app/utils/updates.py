def apply_model_update(instance, data: dict):
    for k, v in data.items():
        setattr(instance, k, v)
    return instance

# auto-assigns fields from data to the object