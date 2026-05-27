export async function isEmpty(collection) {
  const count = await collection.estimatedDocumentCount();
  return count === 0;
}