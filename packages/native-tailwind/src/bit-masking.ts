/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-console */
const READ_PERMISSION = 4;
const WRITE_PERMISSION = 2;
const EXECUTE_PERMISSION = 1;

const testPermission = 1;

if ((testPermission & READ_PERMISSION) == READ_PERMISSION) {
  console.log(`Permission: ${testPermission}: CAN READ`);
} else {
  console.log(`Permission: ${testPermission}: CAN NOT READ`);
}

console.log('CONCAT: ', READ_PERMISSION | WRITE_PERMISSION);
