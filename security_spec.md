# Security Specification: Simonev APBDes Firestore Rules

This document outlines the security requirements, data invariants, and adversarial test scenarios ("Dirty Dozen") for the Simonev APBDes cloud database.

## 1. Data Invariants

1. **Activity Constraints**:
   - `id`: Must be a valid string identifier.
   - `name`: Max 250 characters. Cannot be empty.
   - `village`: Must be one of `Bangun Mulya`, `Sesulu`, or `Api-api`.
   - `sector`: Must be one of the five authorized APBDes sectors.
   - `budgetTotal`: Must be a non-negative number.
   - `budgetSpent`: Must be a non-negative number and less than or equal to `budgetTotal`.
   - `progressPhysical`: Must be between `0` and `100` inclusive.
   - `status`: Must be one of `BELUM_MULAI`, `DALAM_PROSES`, `MENUNGGU_EVALUASI`, `SELESAI`.
   - `isKecamatanApproved`: Must be a boolean value. If `true`, `status` must be `SELESAI`.
   - `approvedBy`: String of max 100 characters. Only populated if `isKecamatanApproved` is true.

2. **Notification Log Constraints**:
   - `id`: Valid unique string identifier.
   - `title`: Max 100 characters.
   - `description`: Max 1000 characters.
   - `timestamp`: Must match server request time or valid ISO format.
   - `type`: Must be one of `info`, `success`, `warn`, `approval`.
   - `village`: If present, must be one of `Bangun Mulya`, `Sesulu`, or `Api-api`.

## 2. The "Dirty Dozen" Payloads

Here are 12 specific payloads designed to breach integrity and access controls:

### Payload 1: Negative Budget Allocation
```json
{
  "id": "act-malicious-1",
  "name": "Semenisasi Ilegal",
  "village": "Bangun Mulya",
  "sector": "Pembangunan Desa (Infrastruktur)",
  "budgetTotal": -50000000,
  "budgetSpent": 0,
  "progressPhysical": 0,
  "status": "BELUM_MULAI",
  "isKecamatanApproved": false,
  "createdAt": "2026-06-14T07:11:00Z",
  "lastUpdated": "2026-06-14T07:11:00Z"
}
```
*Expected Result: PE_DENIED (Negative Budget Total)*

### Payload 2: Spent Exceeds Total Budget
```json
{
  "id": "act-malicious-2",
  "name": "Suhu Proyek",
  "village": "Sesulu",
  "sector": "Pembangunan Desa (Infrastruktur)",
  "budgetTotal": 1000000,
  "budgetSpent": 2000000,
  "progressPhysical": 50,
  "status": "DALAM_PROSES",
  "isKecamatanApproved": false,
  "createdAt": "2026-06-14T07:11:00Z",
  "lastUpdated": "2026-06-14T07:11:00Z"
}
```
*Expected Result: PE_DENIED (Spent > Total)*

### Payload 3: Physical Progress Over 100%
```json
{
  "id": "act-malicious-3",
  "name": "Semenisasi Super",
  "village": "Api-api",
  "sector": "Pembangunan Desa (Infrastruktur)",
  "budgetTotal": 100000000,
  "budgetSpent": 50000000,
  "progressPhysical": 150,
  "status": "DALAM_PROSES",
  "isKecamatanApproved": false,
  "createdAt": "2026-06-14T07:11:00Z",
  "lastUpdated": "2026-06-14T07:11:00Z"
}
```
*Expected Result: PE_DENIED (Physical Progress > 100)*

### Payload 4: Self-ACC / Direct Approval by Operator
```json
{
  "id": "act-malicious-4",
  "name": "Pembangunan Kantor",
  "village": "Bangun Mulya",
  "sector": "Penyelenggaraan Pemerintahan",
  "budgetTotal": 50000000,
  "budgetSpent": 50000000,
  "progressPhysical": 100,
  "status": "SELESAI",
  "isKecamatanApproved": true,
  "approvedBy": "Operator Sendiri",
  "createdAt": "2026-06-14T07:11:00Z",
  "lastUpdated": "2026-06-14T07:11:00Z"
}
```
*Expected Result: PE_DENIED (Self-approval by village operator without Kecamatan rights)*

### Payload 5: Injection of Invalid Village Name
```json
{
  "id": "act-malicious-5",
  "name": "Proyek Siluman",
  "village": "Desa Fiktif",
  "sector": "Pembangunan Desa (Infrastruktur)",
  "budgetTotal": 40000000,
  "budgetSpent": 0,
  "progressPhysical": 0,
  "status": "BELUM_MULAI",
  "isKecamatanApproved": false,
  "createdAt": "2026-06-14T07:11:00Z",
  "lastUpdated": "2026-06-14T07:11:00Z"
}
```
*Expected Result: PE_DENIED (Invalid Village)*

### Payload 6: Injection of Invalid Sector
```json
{
  "id": "act-malicious-6",
  "name": "Semenisasi Gelap",
  "village": "Sesulu",
  "sector": "Sektor Rahasia Bintang",
  "budgetTotal": 40000000,
  "budgetSpent": 0,
  "progressPhysical": 0,
  "status": "BELUM_MULAI",
  "isKecamatanApproved": false,
  "createdAt": "2026-06-14T07:11:00Z",
  "lastUpdated": "2026-06-14T07:11:00Z"
}
```
*Expected Result: PE_DENIED (Invalid Sector)*

### Payload 7: Shadow Update on CreatedAt Field
```json
{
  "id": "act-existing-1",
  "name": "Semenisasi Jalan Usaha Tani RT 05 Dusun Harapan",
  "village": "Bangun Mulya",
  "sector": "Pembangunan Desa (Infrastruktur)",
  "budgetTotal": 125000000,
  "budgetSpent": 90000000,
  "progressPhysical": 80,
  "status": "DALAM_PROSES",
  "isKecamatanApproved": false,
  "createdAt": "2020-01-01T00:00:00Z",
  "lastUpdated": "2026-06-14T07:11:00Z"
}
```
*Expected Result: PE_DENIED (createdAt is immortal/immutable)*

### Payload 8: Write to System Logs as Malicious Anonymous user
```json
{
  "id": "log-malicious-1",
  "title": "Hack Attack Success",
  "description": "System wiped out.",
  "timestamp": "2026-06-14T07:11:00Z",
  "type": "approval",
  "village": "Bangun Mulya"
}
```
*Expected Result: PE_DENIED (Public users can only create logs of type 'warn' (aduan warga), not system approvals)*

### Payload 9: Invalid Status State Shortcutting (Belum Mulai directly to Terverifikasi)
```json
{
  "id": "act-malicious-9",
  "name": "Shortcut Proyek",
  "village": "Api-api",
  "sector": "Pemberdayaan Masyarakat",
  "budgetTotal": 50000000,
  "budgetSpent": 0,
  "progressPhysical": 10,
  "status": "SELESAI",
  "isKecamatanApproved": true,
  "createdAt": "2026-06-14T07:11:00Z",
  "lastUpdated": "2026-06-14T07:11:00Z"
}
```
*Expected Result: PE_DENIED (Physical progress must be 100 before status can be SELESAI)*

### Payload 10: Value Poisoning (budgetTotal with Boolean)
```json
{
  "id": "act-malicious-10",
  "name": "Suhu Anggaran",
  "village": "Api-api",
  "sector": "Pemberdayaan Masyarakat",
  "budgetTotal": true,
  "budgetSpent": 0,
  "progressPhysical": 0,
  "status": "BELUM_MULAI",
  "isKecamatanApproved": false,
  "createdAt": "2026-06-14T07:11:00Z",
  "lastUpdated": "2026-06-14T07:11:00Z"
}
```
*Expected Result: PE_DENIED (Invalid Type for budgetTotal)*

### Payload 11: Malicious ID Injection (Huge ID String)
```json
{
  "id": "act-very-long-id-that-is-over-100-characters-designed-to-exhaust-system-resources-and-cause-wallet-draining",
  "name": "Suhu Air",
  "village": "Sesulu",
  "sector": "Pemberdayaan Masyarakat",
  "budgetTotal": 10000000,
  "budgetSpent": 0,
  "progressPhysical": 0,
  "status": "BELUM_MULAI",
  "isKecamatanApproved": false,
  "createdAt": "2026-06-14T07:11:00Z",
  "lastUpdated": "2026-06-14T07:11:00Z"
}
```
*Expected Result: PE_DENIED (isValidId enforcement)*

### Payload 12: Modification of Terminal State (Editing Approved Activity)
```json
{
  "id": "act-approved-and-verified-2",
  "name": "Pembangunan Posyandu Terintegrasi Kasih Ibu",
  "village": "Bangun Mulya",
  "sector": "Pembangunan Desa (Infrastruktur)",
  "budgetTotal": 85000000,
  "budgetSpent": 85000000,
  "progressPhysical": 100,
  "status": "SELESAI",
  "isKecamatanApproved": true,
  "recommendation": "Re-routing all remaining funds of APBDes to private wallet",
  "createdAt": "2026-02-15T09:00:00Z",
  "lastUpdated": "2026-06-14T07:11:00Z"
}
```
*Expected Result: PE_DENIED (Approved/Terminal state locking)*

## 3. Test Runner Draft Schema

A comprehensive series of unit tests verifying all operations against the "Dirty Dozen" is established below in terms of security assertions matching the `firestore.rules`.
