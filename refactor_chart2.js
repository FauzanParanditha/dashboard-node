const fs = require('fs');
const path = require('path');

const filePath = '/Users/pandi-fauzan/PANDI-Fauzan/Fauzan/Nodejs/dashboard/src/components/home/performance-chart.tsx';
let code = fs.readFileSync(filePath, 'utf8');

const regex = /<Segmented[\s\S]*?options=\{\[[\s\S]*?\{ label: "Yearly", value: "yearly" \},[\s\S]*?\]\}[\s\S]*?value=\{chartPeriod\}[\s\S]*?onChange=\{\(value\) => setChartPeriod\(value as string\)\}[\s\S]*?\/>/;
code = code.replace(regex, '');

fs.writeFileSync(filePath, code);
