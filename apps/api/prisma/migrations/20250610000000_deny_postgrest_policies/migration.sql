-- Belt-and-suspenders: explicit deny-all policies for PostgREST roles (PIPEDA / gov audit).
-- REVOKE in 20250609000000 remains primary; policies document intent for Supabase advisors.

CREATE POLICY block_data_api_organization ON "Organization" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY block_data_api_user ON "User" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY block_data_api_telegramlink ON "TelegramLink" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY block_data_api_refreshtoken ON "RefreshToken" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY block_data_api_wallet ON "Wallet" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY block_data_api_quote ON "Quote" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY block_data_api_transaction ON "Transaction" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY block_data_api_paymentintent ON "PaymentIntent" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY block_data_api_kycsubmission ON "KycSubmission" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY block_data_api_ledgerentry ON "LedgerEntry" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY block_data_api_auditlog ON "AuditLog" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY block_data_api_teaminvite ON "TeamInvite" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY block_data_api_partner ON "Partner" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
