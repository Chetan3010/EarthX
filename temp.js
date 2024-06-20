days=10
hours=2
minutes=1
seconds=19

let time = ``
if(days) time+=`${days} days, `
if(hours) time+=`${hours} hours, `
if(minutes) time+=`${minutes} minutes, `
if (seconds) time += `${seconds} seconds`

console.log(time);
