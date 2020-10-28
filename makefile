install:
	npm install

start:
	npm start

deploy:
	git archive -o bot.zip HEAD
	scp bot.zip discord-bot:~/bot.zip
	ssh discord-bot ' \
		unzip -uo ~/bot.zip -d ~/stretch-discord; \
		rm -f bot.zip; \
		cd ~/stretch-discord; \
		make install && make start; \
	'
	rm -f bot.zip
