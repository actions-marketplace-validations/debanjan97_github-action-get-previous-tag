const { exec } = require('child_process');
const fs = require('fs');
const tagPrefix = `${process.env.INPUT_PREFIX || ''}*`;
const stableMode = `${process.env.INPUT_STABLE}` === 'true'
const sortMode = `${process.env.INPUT_SORTBY}` === 'date' ? '-creatordate' : '-v:refname'

exec(`git for-each-ref --sort=${sortMode} --count 1 --format="%(refname:short)" "refs/tags/${tagPrefix}"`, (err, tag, stderr) => {
    tag = tag.trim();
    if (stableMode) {
        tag = tag.split("-")[0]
    }

    if (err) {
        console.log('\x1b[33m%s\x1b[0m', 'Could not find any tags because: ');
        console.log('\x1b[31m%s\x1b[0m', stderr);
        process.exit(1);
    } else if (tag === "") {
        let timestamp = Math.floor(new Date().getTime() / 1000);
        console.log('\x1b[33m%s\x1b[0m', 'Falling back to default tag');
        console.log('\x1b[32m%s\x1b[0m', `Found tag: ${process.env.INPUT_FALLBACK}`);
        console.log('\x1b[32m%s\x1b[0m', `Found timestamp: ${timestamp}`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `tag=${process.env.INPUT_FALLBACK}\n`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `timestamp=${timestamp}\n`);
        process.exit(0);
    }

    exec(`git log -1 --format=%at ${tag}`, (err, timestamp, stderr) => {
        if (err) {
            console.log('\x1b[33m%s\x1b[0m', 'Could not find any timestamp because: ');
            console.log('\x1b[31m%s\x1b[0m', stderr);
            process.exit(1);
        }

        timestamp = timestamp.trim();

        console.log('\x1b[32m%s\x1b[0m', `Found tag: ${tag}`);
        console.log('\x1b[32m%s\x1b[0m', `Found timestamp: ${timestamp}`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `tag=${tag}\n`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `timestamp=${timestamp}\n`);
        process.exit(0);
    });
});
