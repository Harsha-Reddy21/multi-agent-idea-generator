INSERT INTO public.sage_ai_question_mapping 
(id, source_question_id, target_question_id, target_form_type) VALUES
(gen_random_uuid(), 'D-Q01', 'AI-Q5', 'ai-registry-form'),
(gen_random_uuid(), 'D-Q01', 'S-Q1', 'security-arch-form'),
(gen_random_uuid(), 'D-Q03', 'AI-Q6', 'ai-registry-form'),
(gen_random_uuid(), 'D-Q03', 'L-Q5', 'dlo-form'),
(gen_random_uuid(), 'AI-Q8', 'S-Q2', 'security-arch-form'),
(gen_random_uuid(), 'AI-Q8', 'L-Q6', 'dlo-form'),
(gen_random_uuid(), 'AI-Q9', 'S-Q29', 'security-arch-form'),
(gen_random_uuid(), 'AI-Q29', 'S-Q4', 'security-arch-form'),
(gen_random_uuid(), 'D-Q04', 'AI-Q7', 'ai-registry-form');