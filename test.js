const test = new Promise((resolve, reject) => {
  setTimeout(() => resolve("vfdv"), 3000);
});

async function funny(number) {
  console.log(number);
  await test;
  console.log("test between");
  await test;
  console.log("test finish");
}

funny(1);
funny(2);
