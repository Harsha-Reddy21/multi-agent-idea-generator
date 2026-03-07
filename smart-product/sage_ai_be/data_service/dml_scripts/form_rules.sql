-- Form Rules Based on Business Journey Questions
-- This script inserts rules for form categorization based on submission journey answers
-- Form IDs mapping:
-- 500461d1-6424-4f9e-b413-ed5467d46137 = ai-registry-form
-- 9cda8733-f311-4c6a-8286-ef82bfaf1323 = dlo-form (privacy)
-- 71ffb316-c9f1-4d46-b90f-b32554e92c10 = wwtp-form (Add New Engagement)
-- efb55f08-2284-4966-9d47-82862adc259f = security-arch-form (SAE)
-- d4e5f6a7-b8c9-4d0e-a1f2-3b4c5d6e7f8a = wwtp-new-vendor-form (Add New Vendor)

-- ============================================================================
-- Row 1: Q1=Yes, Q2=Yes, Q3=Yes
-- AI Registry, SAE, Privacy, WWTP (Add New Engagement) are RECOMMENDED
-- This means wwtp-form (for existing vendor scenarios)
-- ============================================================================

-- AI Registry: recommended when BS-Q1=Yes, BS-Q2=Yes, BS-Q3=Yes
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), '500461d1-6424-4f9e-b413-ed5467d46137', 'recommended', '{"BS-Q1": "Yes", "BS-Q2": "Yes", "BS-Q3": "Yes"}'::jsonb, NOW(), NOW());

-- SAE: recommended when BS-Q1=Yes, BS-Q2=Yes, BS-Q3=Yes
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), 'efb55f08-2284-4966-9d47-82862adc259f', 'recommended', '{"BS-Q1": "Yes", "BS-Q2": "Yes", "BS-Q3": "Yes"}'::jsonb, NOW(), NOW());

-- Privacy: recommended when BS-Q1=Yes, BS-Q2=Yes, BS-Q3=Yes
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), '9cda8733-f311-4c6a-8286-ef82bfaf1323', 'recommended', '{"BS-Q1": "Yes", "BS-Q2": "Yes", "BS-Q3": "Yes"}'::jsonb, NOW(), NOW());

-- WWTP (Add New Engagement): recommended when BS-Q1=Yes, BS-Q2=Yes, BS-Q3=Yes
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), '71ffb316-c9f1-4d46-b90f-b32554e92c10', 'recommended', '{"BS-Q1": "Yes", "BS-Q2": "Yes", "BS-Q3": "Yes"}'::jsonb, NOW(), NOW());

-- ============================================================================
-- Row 2: Q1=Yes, Q2=Yes, Q3=No
-- AI Registry, SAE, Privacy, WWTP (Add New Vendor & New Engagement) are RECOMMENDED
-- This means wwtp-new-vendor-form (for new vendor scenarios)
-- ============================================================================

-- AI Registry: recommended when BS-Q1=Yes, BS-Q2=Yes, BS-Q3=No
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), '500461d1-6424-4f9e-b413-ed5467d46137', 'recommended', '{"BS-Q1": "Yes", "BS-Q2": "Yes", "BS-Q3": "No"}'::jsonb, NOW(), NOW());

-- SAE: recommended when BS-Q1=Yes, BS-Q2=Yes, BS-Q3=No
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), 'efb55f08-2284-4966-9d47-82862adc259f', 'recommended', '{"BS-Q1": "Yes", "BS-Q2": "Yes", "BS-Q3": "No"}'::jsonb, NOW(), NOW());

-- Privacy: recommended when BS-Q1=Yes, BS-Q2=Yes, BS-Q3=No
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), '9cda8733-f311-4c6a-8286-ef82bfaf1323', 'recommended', '{"BS-Q1": "Yes", "BS-Q2": "Yes", "BS-Q3": "No"}'::jsonb, NOW(), NOW());

-- WWTP New Vendor: recommended when BS-Q1=Yes, BS-Q2=Yes, BS-Q3=No
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), 'd4e5f6a7-b8c9-4d0e-a1f2-3b4c5d6e7f8a', 'recommended', '{"BS-Q1": "Yes", "BS-Q2": "Yes", "BS-Q3": "No"}'::jsonb, NOW(), NOW());

-- ============================================================================
-- Row 3: Q1=Yes, Q2=No, Q3=NA
-- AI Registry, SAE, Privacy are RECOMMENDED
-- WWTP (Add New Engagement) is OPTIONAL - wwtp-form for existing vendor
-- ============================================================================

-- AI Registry: recommended when BS-Q1=Yes, BS-Q2=No
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), '500461d1-6424-4f9e-b413-ed5467d46137', 'recommended', '{"BS-Q1": "Yes", "BS-Q2": "No"}'::jsonb, NOW(), NOW());

-- SAE: recommended when BS-Q1=Yes, BS-Q2=No
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), 'efb55f08-2284-4966-9d47-82862adc259f', 'recommended', '{"BS-Q1": "Yes", "BS-Q2": "No"}'::jsonb, NOW(), NOW());

-- Privacy: recommended when BS-Q1=Yes, BS-Q2=No
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), '9cda8733-f311-4c6a-8286-ef82bfaf1323', 'recommended', '{"BS-Q1": "Yes", "BS-Q2": "No"}'::jsonb, NOW(), NOW());

-- WWTP (Add New Engagement): optional when BS-Q1=Yes, BS-Q2=No
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), '71ffb316-c9f1-4d46-b90f-b32554e92c10', 'optional', '{"BS-Q1": "Yes", "BS-Q2": "No"}'::jsonb, NOW(), NOW());

-- ============================================================================
-- Row 4: Q1=No, Q2=Yes, Q3=Yes
-- AI Registry, SAE, WWTP (Add New Engagement) are RECOMMENDED
-- This means wwtp-form (for existing vendor scenarios)
-- Privacy is OPTIONAL
-- ============================================================================

-- AI Registry: recommended when BS-Q1=No, BS-Q2=Yes, BS-Q3=Yes
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), '500461d1-6424-4f9e-b413-ed5467d46137', 'recommended', '{"BS-Q1": "No", "BS-Q2": "Yes", "BS-Q3": "Yes"}'::jsonb, NOW(), NOW());

-- SAE: recommended when BS-Q1=No, BS-Q2=Yes, BS-Q3=Yes
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), 'efb55f08-2284-4966-9d47-82862adc259f', 'recommended', '{"BS-Q1": "No", "BS-Q2": "Yes", "BS-Q3": "Yes"}'::jsonb, NOW(), NOW());

-- WWTP (Add New Engagement): recommended when BS-Q1=No, BS-Q2=Yes, BS-Q3=Yes
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), '71ffb316-c9f1-4d46-b90f-b32554e92c10', 'recommended', '{"BS-Q1": "No", "BS-Q2": "Yes", "BS-Q3": "Yes"}'::jsonb, NOW(), NOW());

-- Privacy: optional when BS-Q1=No, BS-Q2=Yes, BS-Q3=Yes
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), '9cda8733-f311-4c6a-8286-ef82bfaf1323', 'optional', '{"BS-Q1": "No", "BS-Q2": "Yes", "BS-Q3": "Yes"}'::jsonb, NOW(), NOW());

-- ============================================================================
-- Row 5: Q1=No, Q2=Yes, Q3=No
-- AI Registry, SAE, WWTP (Add New Vendor & New Engagement) are RECOMMENDED
-- This means wwtp-new-vendor-form (for new vendor scenarios)
-- Privacy is OPTIONAL
-- ============================================================================

-- AI Registry: recommended when BS-Q1=No, BS-Q2=Yes, BS-Q3=No
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), '500461d1-6424-4f9e-b413-ed5467d46137', 'recommended', '{"BS-Q1": "No", "BS-Q2": "Yes", "BS-Q3": "No"}'::jsonb, NOW(), NOW());

-- SAE: recommended when BS-Q1=No, BS-Q2=Yes, BS-Q3=No
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), 'efb55f08-2284-4966-9d47-82862adc259f', 'recommended', '{"BS-Q1": "No", "BS-Q2": "Yes", "BS-Q3": "No"}'::jsonb, NOW(), NOW());

-- WWTP New Vendor: recommended when BS-Q1=No, BS-Q2=Yes, BS-Q3=No
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), 'd4e5f6a7-b8c9-4d0e-a1f2-3b4c5d6e7f8a', 'recommended', '{"BS-Q1": "No", "BS-Q2": "Yes", "BS-Q3": "No"}'::jsonb, NOW(), NOW());

-- Privacy: optional when BS-Q1=No, BS-Q2=Yes, BS-Q3=No
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), '9cda8733-f311-4c6a-8286-ef82bfaf1323', 'optional', '{"BS-Q1": "No", "BS-Q2": "Yes", "BS-Q3": "No"}'::jsonb, NOW(), NOW());

-- ============================================================================
-- Row 6: Q1=No, Q2=No, Q3=NA
-- AI Registry, SAE are RECOMMENDED
-- Privacy, WWTP (Add New Engagement) are OPTIONAL - wwtp-form for existing vendor
-- ============================================================================

-- AI Registry: recommended when BS-Q1=No, BS-Q2=No
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), '500461d1-6424-4f9e-b413-ed5467d46137', 'recommended', '{"BS-Q1": "No", "BS-Q2": "No"}'::jsonb, NOW(), NOW());

-- SAE: recommended when BS-Q1=No, BS-Q2=No
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), 'efb55f08-2284-4966-9d47-82862adc259f', 'recommended', '{"BS-Q1": "No", "BS-Q2": "No"}'::jsonb, NOW(), NOW());

-- Privacy: optional when BS-Q1=No, BS-Q2=No
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), '9cda8733-f311-4c6a-8286-ef82bfaf1323', 'optional', '{"BS-Q1": "No", "BS-Q2": "No"}'::jsonb, NOW(), NOW());

-- WWTP (Add New Engagement): optional when BS-Q1=No, BS-Q2=No
INSERT INTO public.sage_ai_form_rules (id, form_id, category, condition_json, created_at, updated_at)
VALUES (gen_random_uuid(), '71ffb316-c9f1-4d46-b90f-b32554e92c10', 'optional', '{"BS-Q1": "No", "BS-Q2": "No"}'::jsonb, NOW(), NOW());

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Query to verify inserted rules
-- SELECT * FROM public.sage_ai_form_rules ORDER BY created_at DESC;

-- Query to get all form schemas
-- SELECT id, name, form_type FROM public.sage_ai_form_schemas;

-- Query to check form rules count by condition
-- SELECT condition_json, COUNT(*) as rule_count 
-- FROM public.sage_ai_form_rules 
-- GROUP BY condition_json 
-- ORDER BY condition_json;