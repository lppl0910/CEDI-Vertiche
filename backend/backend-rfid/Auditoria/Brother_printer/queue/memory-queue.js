const queue = [];

let processing = false;

export async function addJob(job) {

    queue.push(job);

    procesarCola();
}

async function procesarCola() {

    if (processing) return;

    processing = true;

    while (queue.length > 0) {

        const job = queue.shift();

        try {

            await job();

        } catch (error) {

            console.log(error);
        }
    }

    processing = false;
}