// interface IEnvVars {
//   NEXT_PUBLIC_BASE_URL: string
// }

// const loadEnvVars = (): IEnvVars => {
//   const requiredEnvVar: string[] = [
//     'NEXT_PUBLIC_BASE_URL'
//   ];
//   requiredEnvVar.forEach((key) => {
//     if (!(key in process.env)) {
//       console.log(process.env);
//       throw new Error(`env not found error -> ${key}`);
//     }
//   });
//   return {
//     NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL as string
//   }
// };

// export const envVars = loadEnvVars();
