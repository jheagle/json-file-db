Where you are: branch create-cli/detect-query-complete. Nothing is committed yet, but you have a new failing test (a ; inside an open string) and TODOs at the three places that need to change.

queryStatus already handles this. It's exported from src/data/queries/queryStatus.ts. It returns { complete, waitingFor } and uses the parser's own rules, so it already ignores a ; inside a string, a comment or brackets. Each of your TODOs maps to one change:

1. /exit (line 33): only treat it as a command when inputBuffer is empty. Partway through a query, it's just text.
2. Blank lines (line 40): skip them only when the buffer is empty. Inside an open string or bracket, a blank line belongs to the query.
3. Appending (line 46): append the raw line, not trimmedLine, and join with '\n', not ' '. The queryStatus docs ask for this: a -- comment ends at the end of a line, so joining with spaces would swallow the rest of the query into the comment.
4. The ; check (line 50): replace trimmedLine.endsWith(';') with queryStatus(inputBuffer).complete. You can use waitingFor for a psql-style prompt ('>, (>, /*>), or keep the plain -> for now.
5. Leave the trailing ; in place. The parser accepts it since #46, so the plan's "strip the ;" step no longer applies.

Your new test will fail once you make change 3. It expects "hello; world", but the user pressed Enter inside the string, so the stored value really has a newline in it. The correct expectation is:
['read foo where note = "hello;\n world";']
The current code's ' ' join is what hides this.

Some tests worth adding while you're in there:
- /exit typed inside an open quote doesn't close the session.
- A blank line inside an open bracket is kept.
- A -- comment on one line doesn't swallow the next line.
- read foo; -- note counts as complete.