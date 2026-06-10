# Verify checklist — after Cursor executes one task

**Use with:** `python -m core.mark_done --project <id> --done 0 --verify "..."`

## Steps

1. Run the **VERIFY** command from the Cursor prompt (script or test).
2. Paste a one-line result below (PASS/FAIL + summary).
3. If **PASS** → mark done:
   ```bash
   cd ~/Desktop/SinaPromptOS && . .venv/bin/activate
   python -m core.mark_done --project virlux --done 0 --verify "PASS: ..."
   ```
4. If **FAIL** → mark blocked:
   ```bash
   python -m core.mark_done --project virlux --done 0 --blocked --reason "FAIL: ..."
   ```

## Rules

- Only move **index 0** (`next_tasks[0]`) unless ASF says otherwise.
- Do not add new tasks to `next_tasks` without ASF / Prompt OS planning session.
- Feature freeze on DELIVERY repos still applies.

## Last verify

_(paste output here for human memory — optional)_
