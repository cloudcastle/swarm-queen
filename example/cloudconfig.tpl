#cloud-config

coreos:
  update:
    reboot-strategy: "off"

  units:
    - name: swarm-queen.service
      command: start
      enable: true
      content: |
        [Unit]
        Description=Swarm Queen service
        After=docker.service

        [Service]
        Slice=machine.slice
        Restart=always
        ExecStart=/usr/bin/rkt run \
                    --insecure-options=image \
                    --trust-keys-from-https \
                    --set-env="DEEPSTREAM_URL=${deepstream_url}" \
                    --volume os,kind=host,source=/ \
                    --mount volume=os,target=/os \
                    --dns=8.8.8.8 \
                    docker://dockhero/swarm-queen -- agent

        [Install]
        WantedBy=multi-user.target
