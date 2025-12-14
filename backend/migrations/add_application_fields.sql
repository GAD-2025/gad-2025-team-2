-- Migration: Add interview, acceptance, and coordination fields to applications table
-- Run this SQL to add the new columns to your database

ALTER TABLE applications 
ADD COLUMN interviewData TEXT NULL COMMENT '면접 제안 정보 (JSON)',
ADD COLUMN acceptanceData TEXT NULL COMMENT '합격 안내 정보 (JSON)',
ADD COLUMN coordinationMessages TEXT NULL COMMENT '조율 메시지 목록 (JSON 배열)',
ADD COLUMN firstWorkDateConfirmed VARCHAR(50) NULL COMMENT '채용 확정된 첫 출근 날짜 (YYYY-MM-DD)';
