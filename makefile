PM2=node_modules/.bin/pm2

install:
	touch channels_ids
	cp -n .env.dist .env
	npm install

start:
	npm start

start-server:
	ssh discord-bot 'cd ~/stretch-discord; $(PM2) start src/index.js --name stretch-bot'

stop-server:
	ssh discord-bot 'cd ~/stretch-discord; $(PM2) stop stretch-bot'

reload-server:
	$(PM2) reload stretch-bot

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
