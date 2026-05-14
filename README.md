# tree-sitter-teradata

Fork of [tree-sitter-sql](https://github.com/derekstride/tree-sitter-sql)

## Development

### Step 1: generate and test

**Using `tree-sitter-cli`**
```bash
tree-sitter generate
tree-sitter test
```

### Step 2: Compile the Parser

Tree-sitter parsers need to be compiled as a shared-object / dynamic-library, you can enable this by passing the
`-shared` & `-fPIC` flags to your compiler.

```bash
cc -shared -fPIC -I./src src/parser.c src/scanner.c -o teradata.so
```

### Step 3: Deploy so and queries

```bash
cp teradata.so .../parser/teradata.so
cp queries/*.scm .../queries/teradata/*.scm
```

## BTEQ

Minimal support for BTEQ commands: If, Logon, Logoff, Exit, Quit, Goto, Label, Set, Run
