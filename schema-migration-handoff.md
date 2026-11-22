# Schema migration handoff

Database changes that must be run by hand, in order. `npm run db:sync` only creates missing
tables; it never adds columns. Every script below does a dry run by default and changes data
only with `--apply`.

## 1. Homework soft delete + audit columns (`homeworks`)

**Why:** admins (and teachers) now soft-delete assignments, admins can restore them from
"Recently deleted", and the app records who last edited and who deleted an assignment.

**Script:** `backend/src/scripts/addHomeworkSoftDelete.js`

Adds to `homeworks`:

| column | type | meaning |
|---|---|---|
| `deleted_at` | `DATETIME NULL` (indexed) | set when deleted; `NULL` = live |
| `updated_by_user_id` | `INT UNSIGNED NULL`, FK `users.id` `ON DELETE SET NULL` | who last edited |
| `deleted_by_user_id` | `INT UNSIGNED NULL`, FK `users.id` `ON DELETE SET NULL` | who deleted |

Existing rows are not changed (all stay live).

**Steps**

1. Take a full dump of the `edusphere` database yourself.
2. Dry run (changes nothing), from `backend/`:
   ```
   node src/scripts/addHomeworkSoftDelete.js
   ```
   Check the listed `ALTER TABLE` statements and row counts.
3. Stop the backend.
4. Apply, from `backend/`:
   ```
   node src/scripts/addHomeworkSoftDelete.js --apply
   ```
   It first writes a FULL `mysqldump` of the database to `backend/backups/` (git-ignored).
   Credentials come from `backend/.env`; the password is passed via the `MYSQL_PWD`
   environment variable only. `mysqldump` is found on PATH or in the usual Windows folders
   (MySQL, MariaDB, XAMPP, WAMP, Laragon); otherwise set `MYSQLDUMP_PATH` in `backend/.env`.
   If the backup fails, nothing is changed.
5. Start the backend version whose `Homework` model is `paranoid: true`.
6. Run `npm test` in `backend/`: both permission tests should pass (the ownership test is
   skipped until the columns exist).

**Order matters:** the new backend reads `deleted_at` in every homework query, so it must not
run against a database that has not had step 4.

**Safe to re-run:** columns, the index and the foreign keys that already exist are skipped.

**Undo:** restore the tables from the backup in `backend/backups/` (or your full dump), and run
the previous backend version.

## 2. Gender on every person (`users`, `student_contacts`, `guardians`)

**Why:** every person's name reads "Mr. NAME" / "Miss NAME" (see `backend/src/utils/personTitle.js`).
Staff and students already had `gender`; login accounts, student contacts and guardians did not.

**Script:** `backend/src/scripts/addPersonGender.js`

Adds a nullable `gender` ENUM('male','female') to `users`, `student_contacts` and `guardians`, then
fills only EMPTY genders from existing data:
- `users` from the linked staff / student / guardian record (`user_id`)
- `student_contacts` from `label`, `guardians` from `relationship` ("Father", "Uncle" -> male;
  "Mother", "Aunt" -> female; unknown words stay empty and are listed in the dry run)

Login accounts with no linked person (the admin accounts) stay empty, so they have no title.

**Steps** (backend stopped, from `backend/`):
```
node src/scripts/addPersonGender.js            # dry run, changes nothing
node src/scripts/addPersonGender.js --apply    # full backup into backend/backups/, then the changes
```
Then start the backend.

**Order matters:** the new backend reads `users.gender` on every login, so it must not run
against a database that has not had this step. Safe to re-run.

## 3. Father name for staff (`staff.father_name`)

**Why:** My Profile shows the father name; students already had one, staff did not.

**Script:** `backend/src/scripts/addStaffFatherName.js` (adds `father_name` VARCHAR(150) NULL after
`full_name`; existing staff get it empty and the office fills it in from the staff form).

**Steps** (backend stopped, from `backend/`):
```
node src/scripts/addStaffFatherName.js            # dry run, changes nothing
node src/scripts/addStaffFatherName.js --apply    # full backup into backend/backups/, then the change
```
**Order matters:** the new backend reads `staff.father_name`, so run this before starting it. Safe to re-run.

## 4. Timetable clean-up (data only, no schema change)

**Why:** assembly is not a teaching period (the app now refuses to fill it); old empty rows may
sit in assembly periods. Also lists classes that have no break side in a break period.

**Script:** `backend/src/scripts/fixTimetableSlots.js`
```
node src/scripts/fixTimetableSlots.js            # dry run: what would be deleted + classes missing a break side
node src/scripts/fixTimetableSlots.js --apply    # full backup, then deletes EMPTY assembly rows only
```
Assembly rows that hold something are only listed, never deleted. Classes missing a break side
are only listed: set them in Timetable -> Manage breaks (cup icon). Safe to re-run.

## 5. Rota tables (`rota_days`, `rota_absences`, `rota_entries`)

**Why:** the daily rota (arrangement for absent teachers) is stored separately from the timetable,
which is never changed by a rota.

**Script:** `backend/src/scripts/createRotaTables.js` (creates only the missing tables; never alters
or drops anything).
```
node src/scripts/createRotaTables.js            # dry run, changes nothing
node src/scripts/createRotaTables.js --apply    # full backup, then creates the three tables
```
**Order matters:** run it before starting the backend that has the rota. Safe to re-run.
