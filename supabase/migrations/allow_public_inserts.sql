-- ==============================================================================
-- ALLOW PUBLIC FORM SUBMISSIONS
-- PROJECT: tgfcwkfolmyaawscfovu
-- ==============================================================================

-- 1. Permitir que QUALQUER UM (Public/Anon) crie um novo chamado
-- Importante: Apenas INSERT é liberado. Eles não podem ver/editar depois.
DROP POLICY IF EXISTS "Public can insert claims" ON warranty_claims;

CREATE POLICY "Public can insert claims" 
ON warranty_claims FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 2. (Opção de Segurança EXTRA) - Liberar leitura apenas do próprio protocolo ID recém criado?
-- Por padrão, o Supabase exige permissão de SELECT para retornar os dados após o INSERT.
-- Se o insert funcionar mas der erro no retorno, precisamos disso:
-- Mas vamos testar primeiro só com a liberação de INSERT.
