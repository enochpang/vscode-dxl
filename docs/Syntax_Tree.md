# Syntax Trees

- Concrete syntax tree (CST), constructed during parsing
- Abstract syntax tree (AST), typed layer on top of untyped CST for anything that needs to deal with source code directly
- High-level intermediate representation (HIR) for everything else

The concrete syntax trees (CST) / Red-Green Tree include the text of the source code in full. They are untyped, so different nodes of different kinds (`NameRef` and `ExprBinary`) have the same type `GreenNode`.

A typed layer on top of the CST is built for analysis purposes, called an abstract syntax tree (AST). All methods of this tree return `Object | undefined` since the parser supports error recovery and allows incomplete trees.

Automatic refactorings can be built on top of the AST since the exact text of the code is known.

The high-level intermediate representation (HIR) are equivalent to classical ASTs. HIRs make it easier to implement parts of a programming language that don't have to worry about original source code text.

Lowering is the process of changing syntactic sugar / shorthand into its lower-level form. For example, a for loop is syntactic sugar for a `while` with an `if` statement:

```
for (i = 0; i < 5; i++>) {
    //Do something
}

int i = 0
while (i < 5>) {
    //Do something
    i++
}
```

This allows for example a type-checker to handle both for and while loops by implementing just the while loop.
