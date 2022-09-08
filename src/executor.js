export class Executor {
    queue;
    timer;

    config = {
        runInterval: 100,
        batchMinInterval: 1000,
        batchMaxItems: 200
    }

    logger;

    constructor(executorConfig, queue, logger, db) {
        this.queue = queue;
        this.logger = logger;
        this.config = { ...this.config, ...executorConfig };
        this.db = db;
    };

    run() {
       this.timer = setTimeout(async () => {
           const batch = [];
           const items = await this.getItems(this.config.batchMinInterval, this.config.batchMaxItems);
           if (items.length) {
               for (let item of items) {
                   if (item) {
                       batch.push(item);
                   }
               }

               if (batch.length) {
                   this.logger.info(`Added ${batch.length} rows`);
                   await this.db.save(batch);
                   // this.logger.debug(batch);
               }
           }

           this.run();
       },  this.config.runInterval);
    }

    async getItems(mininterval, maxitems) {
        // This will collect items from queue until either 'mininterval' is over or 'maxitems' items are collected
        const started = new Date().getTime();
        const items = [];
        while (new Date().getTime() - started < mininterval && items.length < maxitems) {
            const item = this.queue.get();
            if (Object.keys(item).length) {
                items.push(item);
            }
        }
        return items;
    }

    stop() {
        try {
            clearTimeout(this.timer);
        } catch (e) {
            this.logger.error(e);
        }
    }

}