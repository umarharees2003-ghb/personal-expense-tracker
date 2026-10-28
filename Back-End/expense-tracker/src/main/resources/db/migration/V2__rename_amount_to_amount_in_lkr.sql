-- =============================================================================
-- Finora Expense Tracker - Schema Migration (V2)
-- Rename amount to amount_in_LKR in transactions table (Idempotent)
-- =============================================================================

DROP PROCEDURE IF EXISTS rename_amount_column;

DELIMITER $$
CREATE PROCEDURE rename_amount_column()
BEGIN
    IF EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'transactions' 
        AND COLUMN_NAME = 'amount'
    ) THEN
        ALTER TABLE transactions CHANGE COLUMN amount amount_in_LKR DECIMAL(12, 2) NOT NULL;
    END IF;
END$$
DELIMITER ;

CALL rename_amount_column();
DROP PROCEDURE IF EXISTS rename_amount_column;
