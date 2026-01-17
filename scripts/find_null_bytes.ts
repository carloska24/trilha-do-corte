import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Scanning appointments for Null Bytes (0x00)...');

  const columns = [
    'clientName',
    'time',
    'status',
    'notes',
    'clientId',
    'barberId',
    'serviceId',
    'photoUrl',
  ];

  let foundIssues = false;

  for (const col of columns) {
    // Map camelCase to snake_case if necessary (Prisma maps them, but raw SQL usually needs DB names)
    // Looking at schema:
    // clientName -> clientname
    // clientId -> clientid
    // barberId -> barberid
    // serviceId -> serviceid
    // photoUrl -> photourl

    let dbCol = col.toLowerCase();
    // Manual mapping based on schema @map
    if (col === 'clientName') dbCol = 'clientname';
    if (col === 'clientId') dbCol = 'clientid';
    if (col === 'barberId') dbCol = 'barberid';
    if (col === 'serviceId') dbCol = 'serviceid';
    if (col === 'photoUrl') dbCol = 'photourl';

    try {
      // Postgres: strpos(col, chr(0)) > 0
      const query = `SELECT id, "${dbCol}" FROM appointments WHERE strpos("${dbCol}", chr(0)) > 0`;
      const results = await prisma.$queryRawUnsafe<any[]>(query);

      if (results.length > 0) {
        foundIssues = true;
        console.log(
          `\n🚨 FOUND Null Byte in column '${col}' (DB: ${dbCol}) in ${results.length} rows:`
        );
        results.forEach(r => {
          console.log(` - ID: ${r.id}`);
        });
      }
    } catch (err) {
      console.error(`Error checking column ${col}:`, err);
    }
  }

  if (!foundIssues) {
    console.log('\n✅ No Null Bytes found in text columns.');
  } else {
    console.log('\n⚠️ Issues found! Please run a cleanup script.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
