CONTAINER_NAME=discord-bot

install:
	touch channels_ids
	cp -n .env.dist .env
	docker build -t discord-bot .

start:
	docker run -it --rm --privileged discord-bot

start-detached:
	docker run -d --privileged --name $(CONTAINER_NAME) discord-bot

stop-detached:
	docker rm -f $(CONTAINER_NAME) || true

start-server:
	ssh discord-bot 'cd ~/stretch-discord; make start-detached'

stop-server:
	ssh discord-bot '\
		cd ~/stretch-discord; \
		docker rm -f$(CONTAINER_NAME)'

logs-server:
	ssh discord-bot 'cd ~/stretch-discord; docker logs $(CONTAINER_NAME) -f'

deploy:
	git archive -o bot.zip HEAD
	scp bot.zip discord-bot:~/bot.zip
	rm -f bot.zip
	ssh discord-bot ' \
		unzip -uo ~/bot.zip -d ~/stretch-discord; \
		rm -f bot.zip; \
		cd ~/stretch-discord; \
		make stop-detached && make install && make start-detached; \
	'
