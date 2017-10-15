# SWARM QUEEN

Swarm Queen is a CLI tool to bring up a SWARM cluster in AWS quickly.
Launching a cluster of CoreOS machines with Swarm Queen systemd service happens via terraform - see `example` folder

## Bootstrapping a new Swarm cluster

1. Start machines via Terraform. You will be asked for a DEEPSTREAM_URL.
Sign up for https://deepstreamhub.com/, create an app and copy the URL from it's dashboard.
The URL looks like `wss://013.deepstreamhub.com?apiKey=xxxx-xxxx-xxxx-xxxx`

2. Create a shell script `swarm-queen.sh` which calls our docker image:

```
#/bin/bash
docker run -it --rm -e "DEEPSTREAM_URL=<YOUR APP URL>" dockhero/swarm-queen $@
```

Give it `executable` permissions:

```bash
chmod 755 swarm-queen.sh
```

3. Use `swarm-queen.sh` to join machines into swarm:

```
swarm-queen.sh wait   # waits for at least one AWS machine to boot

swarm-queen.sh bootstrap    # makes docker swarm init in AWS

swarm-queen.sh node ls    # to make sure all nodes joined the swarm

swarm-queen.sh service create ..... # to run something in the swarm
```

