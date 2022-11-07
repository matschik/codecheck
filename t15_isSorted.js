let args = process.argv.slice(2);

function byValue(a, b) {
  return a - b;
}
let sorted = [...args].sort(byValue);

let argsjoin = Number(args.join(""));
let sortedjoin = Number(sorted.join(""));

if (!isNaN(argsjoin)) {
  if (argsjoin === sortedjoin) {
    console.log("Triée !");
  } else {
    console.log("Pas triée !");
  }
} else {
  console.log("erreur");
}
