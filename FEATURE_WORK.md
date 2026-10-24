# Create CLI: Both Interactive CLI and direct CLI

## Interactive CLI

Create a prompt where a user can input queries which will be parsed to interact with the database. This is following SQL as the reference for how it should behave.

Basic understanding is prompt awaits input, a user may type and even press RETURN. Once, a query is closed and a line is terminated with a semi-colon (`;`) then the query is consumed by the parser and run. The user may terminate their session by typing `/exit` or with CTRL+C.

## direct CLI

The program can be run with command-line options, directly output to the terminal or even receive queries.

### Additional features

To be considered in this effort or in another feature:

1. Configurable output:
    - Use \[output\] statement within the interactive CLI and select json / csv / dump (export as query)
    - Use CLI arg to select the output type as json / csv / dump (export as query)
2. Show and Describe tables
3. Multiple databases (also with show and describe)
4. User-based sessions (implement security and consider encryption as a future feature). This may need to be done as a different feature entirely since it includes audit logging and permissions. The only consideration for this current feature might be adding -u (to CLI) or user login request (Interactive CLI), but it may not serve any purpose yet (just cosmetic).

#### World Split

[ ] Create basic Interactive input; await query input and add to buffer, be able to exit.
[ ] Pass the buffer to the query parser so it can run the queries.
[ ] Add direct CLI path, script takes args (expects -q / --query as minimum) and will run directly, otherwise opens interactive CLI.
[ ] Direect CLI query can be run.
[ ] Configurable output context (json/csv/dump), in Interactive mode this can be done with a use-statement, or with an argument before opening. Otherwise, with the query included the output is also considered for the direct cli (actual context application does not need to fully function yet)
[ ] (optional) Add user login (does not have to be real, just available)