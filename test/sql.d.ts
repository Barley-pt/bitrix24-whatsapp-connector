// Kept in its own file with no imports: a wildcard `declare module` inside a module file is
// treated as an augmentation of an existing module and fails to resolve.
declare module '*.sql?raw' {
  const content: string;
  export default content;
}
