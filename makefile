CONTAINER_NAME=discord-bot

install:
	mkdir -p data
	touch data/channels_ids
	touch data/sudoku_data
	cp -n .env.dist .env
	docker-compose build

start:
	docker-compose up -d

stop:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

start-server:
	ssh discord-bot 'cd ~/stretch-discord; make start'

stop-server:
	ssh discord-bot 'cd ~/stretch-discord; make stop'

logs-server:
	ssh discord-bot 'cd ~/stretch-discord; make logs'

deploy:
	git archive -o bot.zip HEAD
	scp bot.zip discord-bot:~/bot.zip
	rm -f bot.zip
	ssh discord-bot ' \
		unzip -uo ~/bot.zip -d ~/stretch-discord; \
		rm -f bot.zip; \
		cd ~/stretch-discord; \
		make stop && make install && make start; \
	'
