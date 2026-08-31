-- Trigger to sync kyc_documents status to profiles.kyc_status
CREATE OR REPLACE FUNCTION public.sync_kyc_status_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Map kyc_documents.status to profiles.kyc_status
    -- status in kyc_documents: 'pending', 'approved', 'rejected'
    -- status in profiles: 'Not Started', 'Pending', 'Verified'

    UPDATE public.profiles
    SET kyc_status = CASE
        WHEN NEW.status = 'approved' THEN 'Verified'
        WHEN NEW.status = 'pending' THEN 'Pending'
        WHEN NEW.status = 'rejected' THEN 'Not Started'
        ELSE kyc_status
    END,
    updated_at = now()
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_kyc_status ON public.kyc_documents;
CREATE TRIGGER tr_sync_kyc_status
AFTER INSERT OR UPDATE OF status ON public.kyc_documents
FOR EACH ROW EXECUTE FUNCTION public.sync_kyc_status_to_profile();
