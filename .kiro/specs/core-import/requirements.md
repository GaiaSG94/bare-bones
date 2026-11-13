# core-import — Requirements (EARS)

## 1. Encoding

**Requirement 1.1** — When bytes are decoded, the system shall try strict
UTF-8 first and fall back to windows-1252 when the byte sequence is invalid
UTF-8.

**Requirement 1.2** — The system shall remove a leading byte order mark
from the decoded text.

## 2. Structure

**Requirement 2.1** — The system shall detect the field separator from the
header row, choosing `;`, `,` or tab.

**Requirement 2.2** — When a field is quoted, the system shall honour
escaped quotes (`""`) and separators or newlines inside the quoted field.

**Requirement 2.3** — When a data row does not have the same number of
fields as the header, the system shall reject it with reason
`column-count` and keep its raw content.

## 3. Values

**Requirement 3.1** — The system shall parse dates in `dd/mm/yyyy`,
`yyyy-mm-dd` and `dd-mm-yyyy` formats, and reject impossible dates such as
31/02.

**Requirement 3.2** — The system shall parse numbers written as `1 240,00`
and `1,240.00`.

**Requirement 3.3** — When a value of a date or number column cannot be
parsed, the system shall reject the whole row with reason `invalid-date` or
`invalid-number` and keep the raw line.

## 4. Inference

**Requirement 4.1** — The system shall infer a column type (`date`, `text`,
`category`, `number`) from the values of that column.

**Requirement 4.2** — When a column is inferred as a category, the system
shall expose its distinct levels in the column format.

## 5. Worker

**Requirement 5.1** — When the import runs in a Web Worker, the system shall
return the typed table and the warnings to the calling scope through a
message, and never touch the DOM.
