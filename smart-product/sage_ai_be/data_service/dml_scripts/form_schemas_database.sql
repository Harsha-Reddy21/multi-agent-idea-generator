INSERT INTO sage_ai_form_schemas 
    (id, category_id, name, version, schema_json, is_active, form_type)
VALUES
    (
        '500461d1-6424-4f9e-b413-ed5467d46137'::uuid,
        'f7a3b2c1-8d4e-4f5a-9b6c-7e8f9a0b1c2d'::uuid,
        'ai-registry-form',
        '1.0',
        '{}'::json,
        true,
        'ai-registry-form'
    ),
    (
        'efb55f08-2284-4966-9d47-82862adc259f'::uuid,
        'f7a3b2c1-8d4e-4f5a-9b6c-7e8f9a0b1c2d'::uuid,
        'security-arch-form',
        '1.0',
        '{}'::json,
        true,
        'security-arch-form'
    ),
    (
        '5d6e6256-6a41-45a7-b22e-3e2928f5479c'::uuid,
        'f7a3b2c1-8d4e-4f5a-9b6c-7e8f9a0b1c2d'::uuid,
        'gco-risk-registry-form',
        '1.0',
        '{}'::json,
        false,
        'gco-risk-registry-form'
    ),
    (
        '71ffb316-c9f1-4d46-b90f-b32554e92c10'::uuid,
        'f7a3b2c1-8d4e-4f5a-9b6c-7e8f9a0b1c2d'::uuid,
        'wwtp-form',
        '1.0',
        '{}'::json,
        true,
        'wwtp-form'
    ),
    (
        '9cda8733-f311-4c6a-8286-ef82bfaf1323'::uuid,
        'f7a3b2c1-8d4e-4f5a-9b6c-7e8f9a0b1c2d'::uuid,
        'dlo-form',
        '1.0',
        '{}'::json,
        true,
        'dlo-form'
    ),
    (
        'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d'::uuid,
        'f7a3b2c1-8d4e-4f5a-9b6c-7e8f9a0b1c2d'::uuid,
        'idea-sub-form',
        '1.0',
        '{}'::json,
        true,
        'idea-sub-form'
    ),
    (
        'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'::uuid,
        'f7a3b2c1-8d4e-4f5a-9b6c-7e8f9a0b1c2d'::uuid,
        'ai-registry-update-form',
        '1.0',
        '{}'::json,
        true,
        'ai-registry-update-form'
    ),
    (
        'c3f2e9a1-7b4c-4a2e-9d81-2a6f3b9c8d72'::uuid,
        'f7a3b2c1-8d4e-4f5a-9b6c-7e8f9a0b1c2d'::uuid,
        'wwtp-new-vendor-form',
        '1.0',
        '{}'::json,
        true,
        'wwtp-new-vendor-form'
    )
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  version = EXCLUDED.version,
  schema_json = EXCLUDED.schema_json,
  is_active = EXCLUDED.is_active,
  form_type = EXCLUDED.form_type;
