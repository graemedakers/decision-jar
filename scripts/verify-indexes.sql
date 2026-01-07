-- Query to verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename IN ('Idea', 'JarMember')
ORDER BY tablename, indexname;
