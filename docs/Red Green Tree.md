# Red Green Trees

The green tree is created bottom-up by creating a node that has a value and children. The nodes are 
immutable and only have downward pointers.

The red tree is created top-down created on demand. Each red node contains a parent refernce, positional context, and a green node reference

Gree nodes store

- The syntax kind
- The character count by the node and its descendants
- References to child green nodes

They do not store

- Positional context (absolute position). A green node cannot be used to determine where it resides in the source
- Parent reference

Red nodes store

- A pointer to the parent red node
- An integer position
- A pointer to the underlying green node