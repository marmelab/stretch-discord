PM2=node_modules/pm2/bin/pm2
DOCKER=docker run -it --rm --privileged discord-bot
DOCKER_SERVER=docker run --privileged discord-bot

install:
	touch channels_ids
	cp -n .env.dist .env
	docker build -t discord-bot .

start:
	$(DOCKER) npm run start

start-server:
	ssh discord-bot 'cd ~/stretch-discord; $(DOCKER_SERVER) $(PM2) start src/index.js --name stretch-bot --node-args="--experimental-json-modules"'

stop-server:
	ssh discord-bot 'cd ~/stretch-discord; $(DOCKER_SERVER) $(PM2) stop stretch-bot'

reload-server:
	$(DOCKER_SERVER) $(PM2) reload stretch-bot

logs-server:
	ssh discord-bot 'cd ~/stretch-discord; $(DOCKER_SERVER) $(PM2) logs stretch-bot'

deploy:
	git archive -o bot.zip HEAD
	scp bot.zip discord-bot:~/bot.zip
	rm -f bot.zip
	ssh discord-bot ' \
		unzip -uo ~/bot.zip -d ~/stretch-discord; \
		rm -f bot.zip; \
		cd ~/stretch-discord; \
		make install && make reload-server; \
	'
