CONTAINER_NAME=discord-bot

install:
	touch channels_ids
	cp -n .env.dist .env
	docker build -t discord-bot .

start:
	docker run -it --rm --privileged discord-bot

start-detached:
	docker run -d --privileged --name $(CONTAINER_NAME) discord-bot

start-server:
	ssh discord-bot 'cd ~/stretch-discord; make start-detached'

stop-server:
	ssh discord-bot '\
		cd ~/stretch-discord; \
		docker stop $(CONTAINER_NAME); \
		docker rm $(CONTAINER_NAME)'

logs-server:
	ssh discord-bot 'cd ~/stretch-discord; docker logs $(CONTAINER_NAME)'

deploy:
	git archive -o bot.zip HEAD
	scp bot.zip discord-bot:~/bot.zip
	rm -f bot.zip
	ssh discord-bot ' \
		unzip -uo ~/bot.zip -d ~/stretch-discord; \
		rm -f bot.zip; \
		cd ~/stretch-discord; \
		make install && make start-detached; \
	'
