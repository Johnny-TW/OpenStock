# BAM

目錄

- [BAM 程式碼團隊規則](#bam程式碼團隊規則)
- [BAM 佈署規則](#bam-佈署規則)
- [BAM 系統資料關係圖](#bam系統資料關係)
- [VM 資源清理](#vm資源清理)
- [BAM 版號及分支管理](#版號及分支管理) 更新時間: 2025-04-25

## BAM 程式碼團隊規則

- 欄位都支持多選搜尋，前端用逗號隔開，發送字串給後端
- 若欄位有特定的選項，前端則做出多選選單，用逗號隔開，發送字串給後端，後端則精準搜尋
- 時間欄位的搜尋，用區間作為搜尋的範圍
- 後端 key 一律小寫 snake_style
- 前後端 key <b style='color: red;background-Color: yellow;'>切勿出現空白、數字、特殊符號</b>

<table>
    <tr>
        <th>Key name</th>
        <th>Frontend</th>
        <th>Backend</th>
        <th>Filter</th>
        <th>Remark</th>
        <th>Example</th>
    </tr>
    <tr>
        <td>editor</td>
        <td>
            <pre>
            <code>
    &lt;a
        href={`${import.meta.env.VITE_TEAM_ROSTER_URL}profile/employee_id`}
        target='_blank'
        title= {employee information}
    &gt;
        {_.startCase(_.camelCase(emp_obj?.english_name ?? ''))}
    &lt;/a&gt;
            </code>
            </pre>
        </td>
        <td>
            <pre>
            <code>
    {
        employee_id:    "10712714",
        english_name:   "LEO TU",
        extension:      "26207",
        department_id:     "EQD100",
        job_title:      "project leader"
    }
            </code>
            </pre>
        </td>
        <td>
            - employee_id or english_name </br>
            Filter example: Leo Tu, Bradley Chen, ...
        </td>
        <td>上傳檔案或更新資料的人</td>
        <td>-</td>
    </tr>
    <tr>
        <td>updated_at</td>
        <td>
            Format:</br>
            - YYYY-MM (2024-01)</br>
            - YYYY-MM-DD (2024-01-01)</br>
            - YYYY-MM-DD HH:MM (2024-01-01 10:00)</br>
        </td>
        <td>
一律UTC時間格式
        </td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
    </tr>
    <tr>
        <td>detail</td>
        <td>
        <pre>
        <code>
&lt;Table bordered size='sm' variant='light'&gt;
    &lt;tbody&gt;
    {Object.entries(row[key]).map(([k, v], i) =&gt; (
      &lt;tr key={i}&gt;
        &lt;td&gt;{_.startCase(_.camelCase(k))}&lt;/td&gt;
        &lt;td&gt;{v?.before ?? ' - '}&lt;/td&gt;
        &lt;td&gt;{v.after}&lt;/td&gt;
      &lt;/tr&gt;
    ))}
  &lt;/tbody&gt;
&lt;/Table&gt;
            </code>
            </pre>
        </td>
        <td>
            <pre>
            <code>
[
    {
        key:
        {
            before: '',
            after: 'change text'
        }
    },
    ...
]
            </code>
            </pre>
        </td>
        <td>-</td>
        <td>更改的細項</br>依情況彈性加入action的key</td>
        <td>-</td>
    </tr>
    <tr>
        <td>file</td>
        <td>
            <pre>
            <code>
    &lt;span
        style={{
            cursor: 'pointer',
            color: '#0d6efd',
            whiteSpace: 'nowrap',
            opacity: fileName ? 1 : 0.5,
            pointerEvents: fileName ? 'auto' : 'none'
        }}
        onClick={() => fileDownload(fileName)}
    &gt;
        {fileName ? fileName : '-'}
        &lt;i className={`fas fa-arrow-alt-circle-down ${fileName ? '' : 'd-none'}`} /&gt;
    &lt;/span&gt;
            </code>
            </pre>
        </td>
        <td>
            <code>
            <pre>
{
    original_file_name: 'file',
    path: 'http://123/file/xlsx',
    size: 12385
}
            </code>
            </pre>
        </td>
        <td>
            <pre>
            <code>
filter params:
{
    key_after: 2024-01-01,
    key_before: 2024-03-01
}
            </code>
            </pre>
        </td>
        <td>下載檔案</td>
        <td>-</td>
    </tr>
    <tr>
        <td>source</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>更新檔案的來源</br>System</br>User(english_name)</td>
        <td></td>
    </tr>
    <tr>
        <td>action</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>更新操作</br>System from ...system</br>Upload</br>Edit</td>
        <td>-</td>
    </tr>
</table>

## BAM 佈署規則

如果要佈署 app 到 DQMS QAS 和 PRD 伺服器，請不要直接在 QAS 或是 PRD 伺服器上 build image
因為這個會消耗大量資源，可能會導致伺服器癱瘓，所以請利用 Gitalb CI Runne
或是自己的 DEV-VM build image，然後把 image 推到各自專案的 gitlab-container-registry，
接著透過 CD 的方式佈署到 QAS 或是 PRD，或是透過寫好的 shell script 手動連線到 QAS 或 PRD 伺
器來啟動 container。

### 佈署流程

1. 在 DEV-VM 或 gitlab ci runner 上使用 docker-build.sh build image 並推送至相應 project 的 gitlab container registry
2. 在 QAS 或 PRD 伺服器上使用 docker-deploy.sh 來 pull image 並啟動 container

### 佈署範例 (以 GB04 示範)

以下範例以 GB04 做為示範如何設定並使用這個流程佈署 QAS 和 PRD，
在撰寫其他專案的時候記得自行改動部分路徑和 env 設定。

#### Building & Deploy Shell Script 和 CI/CD 設定

1.  在你要使用的專案新增一個 CI_USER，Settings->Repository->Deploy Tokens，名稱看你想要輸入甚麼
    ，另外幾個欄位可以留空，接著按下建立，然後把他給你的 User 和 Password 寫成`CI_REGISTRY_USER`
    和`CI_REGISTRY_PASSWORD`存在你的.env 裡面，如果要使用 CD 也必須把這兩個變數加
    在 Settings->CI/CD->Variables 裡面

2.  在專案的.gitlab-ci.yml 中加入以下 script，並在.env 當中加入相應的變數，
    之後在步驟 4 設定你的 env，如 env_qas 和 env_prd 的時候都記得要包含這幾個變數。 - `CI_REGISTRY_USER`和`CI_REGISTRY_PASSWORD`是用來登入 gitlab-container-registry 的帳號和密碼 - `DOCKER_APP_CONTAINER`和`DOCKER_WEB_CONTAINER`是用來設定 docker-compose.yml 當中的 container 名稱

        ```yaml
        build_image:
        stage: Deploy  # 記得在最上方stage定義Deploy上去
        image: docker:20.10.17
        tags: ["dqms-shared"]
        before_script:
            - if [ -z "$MODE" ] || [ -z "${MODE+x}" ]; then
                echo -e "\e[31mERROR Please set MODE variable... (Commonly dev, qas, prd).\e[0m";
                exit 1;
              fi;
            - MODE=${MODE:-dev}
            - MODE=$(echo "$MODE" | tr '[:upper:]' '[:lower:]')
            - echo MODE=$MODE
            - >
            if [ $MODE == "qas" ]; then
                echo "QAS mode is selected"
                cat $env_qas > .env
            elif [ $MODE == "prd" ]; then
                echo "PRD mode is selected"
                cat $env_prd > .env
            else
                echo "DEV mode is selected"
                cat $env > .env
            fi
        script:
            - sh docker-build.sh -m $MODE
        when: manual
        ```

3.  在專案的 root directory 加入 docker-build.sh，這個 script 是用來 build image
    並推送到 gitlab-container-registry，記得依據你的專案名稱和 container 名稱做調整
    尤其是最下方兩行`docker push dqms-gitlab.wistron.com:5000/tqms/bam/gb04_opex/app/$MODE`
    和`docker push dqms-gitlab.wistron.com:5000/tqms/bam/gb04_opex/web/$MODE`的路徑必須要在你的專案路徑底下。
    多舉一個例子，如果今天是 GB07 專案那麼這個地方就要修改成`docker push dqms-gitlab.wistron.com:5000/tqms/bam/gb07_budget_tracking/app/$MODE`和
    `docker push dqms-gitlab.wistron.com:5000/tqms/bam/gb07_budget_tracking/web/$MODE`。流程完成後可以在 pipeline 檢查 log 確認他上傳的地方或是到
    [gitlab container registry](https://dqms-gitlab.wistron.com/TQMS/bam/gb04_opex/container_registry)確認是否有成功上傳

            ```shell
            #!/bin/bash docker-build.sh
            # Find CI_REGISTRY_USER and CI_REGISTRY_PASSWORD in the .env file
            CI_REGISTRY_USER=$(grep -E '^CI_REGISTRY_USER=' .env | cut -d '=' -f2)
            CI_REGISTRY_PASSWORD=$(grep -E '^CI_REGISTRY_PASSWORD=' .env | cut -d '=' -f2)
            DOCKER_APP_CONTAINER=$(grep -E '^DOCKER_APP_CONTAINER=' .env | cut -d '=' -f2)
            DOCKER_WEB_CONTAINER=$(grep -E '^DOCKER_WEB_CONTAINER=' .env | cut -d '=' -f2)

            # Set the environment variables to the values found in the .env file, defaulting to empty strings
            CI_REGISTRY_USER=${CI_REGISTRY_USER:-''}
            CI_REGISTRY_USER=${CI_REGISTRY_USER:-''}
            DOCKER_APP_CONTAINER=${DOCKER_APP_CONTAINER:-''}
            DOCKER_WEB_CONTAINER=${DOCKER_WEB_CONTAINER:-''}

            # Check if the environment variables are not set or empty strings
            if [ -z "$CI_REGISTRY_USER" ] || [ -z "$CI_REGISTRY_PASSWORD" ] || [ -z "${CI_REGISTRY_USER+x}" ] || [ -z "${CI_REGISTRY_PASSWORD+x}" ]; then
                echo "Warning: Environment variables CI_REGISTRY_USER or CI_REGISTRY_PASSWORD are not set or empty."
                exit 1
            fi

            # Check if the environment variables are not set or empty strings
            if [ -z "$DOCKER_APP_CONTAINER" ] || [ -z "$DOCKER_WEB_CONTAINER" ] || [ -z "${DOCKER_APP_CONTAINER+x}" ] || [ -z "${DOCKER_WEB_CONTAINER+x}" ]; then
                echo "Warning: Environment variables CI_REGISTRY_USER or CI_REGISTRY_PASSWORD are not set or empty."
                exit 1
            fi

            echo "Using the following environment variables:\n------------------------------------"
            echo "DOCKER_APP_CONTAINER=$DOCKER_APP_CONTAINER"
            echo "DOCKER_WEB_CONTAINER=$DOCKER_WEB_CONTAINER\n------------------------------------\n"


            docker login dqms-gitlab.wistron.com:5000 -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD

            # Check if the -p option is used
            if [ "$1" = "-m" ]; then
                input=$2
            else
                # Prompt the user for input
                read -p "Enter a MODE: " input
            fi

            MODE=$input

            echo Building a  image in MODE = $MODE
            # Export TAG for the docker-compose file
            export TAG=$MODE

            # Build the images
            docker-compose build

            docker push dqms-gitlab.wistron.com:5000/tqms/bam/gb04_opex/app/$MODE
            docker push dqms-gitlab.wistron.com:5000/tqms/bam/gb04_opex/web/$MODE
            ```

4.  整理 gitlab->Settings->CI/CD->Variables 當中的參數，新增 file env，記得紅框
    4 號步驟處一定要把類型選成 file，然後在下面 key 必須輸入你要的名稱，目前的 BAM 規則是-> env 是 DEV 和
    CI 環境(通常是給 CI/CD 用的)，env_qas 是 QAS 環境，env_prd 是 PRD 環境，請注意一個完整的專案會一次包含這
    三種 env，而 value 就是你需要的環境變數設定。另外要注意的就是請不要在 env_qas 和 env_prd 上使用 reference
    的方式例如`VITE_PORT=${DOCKER_WEB_PORT}`請直接寫出他的 PORT 例如`VITE_PORT=8080`，因為這個流程目前會讓 reference 的方式變空值。

    ```shell
    #!/bin/bash docker-build.sh

    # Prevent building image on QAS and PRD servers
    ip_address=$(ip addr show | grep 10.32.48 | awk '{print $2}' | cut -f1 -d'/')

    if [ "$ip_address" = "10.32.48.85" ] || [ "$ip_address" = "10.32.48.245" ]; then
        echo "You are not allowed to build image on QAS and PRD servers."
    fi

    # Find CI_REGISTRY_USER and CI_REGISTRY_PASSWORD in the .env file
    CI_REGISTRY_USER=$(grep -E '^CI_REGISTRY_USER=' .env | cut -d '=' -f2)
    CI_REGISTRY_PASSWORD=$(grep -E '^CI_REGISTRY_PASSWORD=' .env | cut -d '=' -f2)
    DOCKER_APP_CONTAINER=$(grep -E '^DOCKER_APP_CONTAINER=' .env | cut -d '=' -f2)
    DOCKER_WEB_CONTAINER=$(grep -E '^DOCKER_WEB_CONTAINER=' .env | cut -d '=' -f2)

    # Set the environment variables to the values found in the .env file, defaulting to empty strings
    CI_REGISTRY_USER=${CI_REGISTRY_USER:-''}
    CI_REGISTRY_PASSWORD=${CI_REGISTRY_PASSWORD:-''}
    DOCKER_APP_CONTAINER=${DOCKER_APP_CONTAINER:-''}
    DOCKER_WEB_CONTAINER=${DOCKER_WEB_CONTAINER:-''}

    # Check if the environment variables are not set or empty strings
    if [ -z "$CI_REGISTRY_USER" ] || [ -z "$CI_REGISTRY_PASSWORD" ] || [ -z "${CI_REGISTRY_USER+x}" ] || [ -z "${CI_REGISTRY_PASSWORD+x}" ]; then
        echo "Warning: Environment variables CI_REGISTRY_USER or CI_REGISTRY_PASSWORD are not set or empty."
        exit 1
    fi

    # Check if the environment variables are not set or empty strings
    if [ -z "$DOCKER_APP_CONTAINER" ] || [ -z "$DOCKER_WEB_CONTAINER" ] || [ -z "${DOCKER_APP_CONTAINER+x}" ] || [ -z "${DOCKER_WEB_CONTAINER+x}" ]; then
        echo "Warning: Environment variables DOCKER_APP_CONTAINER or DOCKER_WEB_CONTAINER are not set or empty."
        exit 1
    fi

    echo "Using the following environment variables:\n------------------------------------"
    echo "DOCKER_APP_CONTAINER=$DOCKER_APP_CONTAINER"
    echo "DOCKER_WEB_CONTAINER=$DOCKER_WEB_CONTAINER\n------------------------------------\n"


    docker login dqms-gitlab.wistron.com:5000 -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD

    # Check if the -p option is used
    if [ "$1" = "-m" ]; then
        input=$2
    else
        # Prompt the user for input
        read -p "Enter a MODE: " input
    fi

    MODE=$input

    echo Building a  image in MODE = $MODE
    # Export TAG for the docker-compose file
    export TAG=$MODE

    # Build the images
    docker-compose build

    docker push dqms-gitlab.wistron.com:5000/tqms/bam/gb04_opex/app/$MODE
    docker push dqms-gitlab.wistron.com:5000/tqms/bam/gb04_opex/web/$MODE
    ```

5.  整理 gitlab->Settings->CI/CD->Variables 當中的參數，新增 file env，記得紅框
    4 號步驟處一定要把類型選成 file，然後在下面 key 必須輸入你要的名稱，目前的 BAM 規則是-> env 是 DEV 和
    CI 環境(通常是給 CI/CD 用的)，env_qas 是 QAS 環境，env_prd 是 PRD 環境，請注意一個完整的專案會一次包含這
    三種 env，而 value 就是你需要的環境變數設定。另外要注意的就是請不要在 env_qas 和 env_prd 上使用 reference
    的方式例如`VITE_PORT=${DOCKER_WEB_PORT}`請直接寫出他的 PORT 例如`VITE_PORT=8080`，因為這個流程目前會讓 reference 的方式變空值。

        ![env範例設定](./images/env_file設定.png)

6.  在專案的 root directory 加入 docker-deploy.sh，這個是用來手動佈署到 QAS 或是 PRD 的 script，目前的 CD 也是利用這個 script 來進行佈署，啟用的方式如下

    ```shell
    sudo sh docker-deploy.sh -t qas # 啟動QAS
    sudo sh docker-deploy.sh -t prd # 啟動PRD
    sudo sh docker-deploy.sh -t custom_tag # 啟動自定義的tag
    sudo sh docker-deploy.sh # 這樣做的話等一下script會問你要找哪一個tag的image
    ```

    ```shell
    #!/bin/bash docker-deploy.sh

    # Check if the -t option is used
    if [ "$1" = "-t" ]; then
        input=$2
    else
        # Prompt the user for input
        read -p "Enter a value: " input
    fi

    TAG=$input

    export TAG

    # Find CI_REGISTRY_USER and CI_REGISTRY_PASSWORD in the .env file
    CI_REGISTRY_USER=$(grep -E '^CI_REGISTRY_USER=' .env | cut -d '=' -f2)
    CI_REGISTRY_PASSWORD=$(grep -E '^CI_REGISTRY_PASSWORD=' .env | cut -d '=' -f2)

    # Set the environment variables to the values found in the .env file, defaulting to empty strings
    CI_REGISTRY_USER=${CI_REGISTRY_USER:-''}
    CI_REGISTRY_PASSWORD=${CI_REGISTRY_PASSWORD:-''}

    # Check if the environment variables are not set or empty strings
    if [ -z "$CI_REGISTRY_USER" ] || [ -z "$CI_REGISTRY_PASSWORD" ] || [ -z "${CI_REGISTRY_USER+x}" ] || [ -z "${CI_REGISTRY_PASSWORD+x}" ]; then
        echo "Warning: Environment variables CI_REGISTRY_USER or CI_REGISTRY_PASSWORD are not set or empty."
        exit 1
    fi

    docker login dqms-gitlab.wistron.com:5000 -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD

    # Pull the images and check for errors
    docker pull --quiet dqms-gitlab.wistron.com:5000/tqms/bam/gb04_opex/app/$TAG
    if [ $? -ne 0 ]; then
        echo "Error: Image not found"
        exit 1
    fi

    docker pull --quiet dqms-gitlab.wistron.com:5000/tqms/bam/gb04_opex/web/$TAG
    if [ $? -ne 0 ]; then
        echo "Error: Image not found"
        exit 1
    fi

    docker-compose up -d
    ```

7.  在專案的 root directory 調整 docker-compose.yml，在我們的`app`和`web`的部分新增 image 的路徑，這樣才能讓`docker-compose.yml`知道要從哪裡 pull image，其中`${TAG}`參數會在`docker-deploy.sh`裡面輸入

    ```yaml
    version: "3.6"
    services:
    app:
        &django
        restart: unless-stopped
        container_name: ${DOCKER_APP_CONTAINER}
        image: dqms-gitlab.wistron.com:5000/tqms/bam/gb04_opex/app/${TAG}  # 新增這行
        build:
        context: .
        dockerfile: ./deploy/Dockerfile.app
        args:
          - ENV=.env
        env_file: ./.env
        depends_on:
          - db
        expose:
          - ${DOCKER_UWSGI_INTERNAL_PORT}
        volumes:
          - ${DOCKER_CERTIFICATE_PATH}:/cert
          - type: volume
              source: log
              target: /log
              volume:
              nocopy: false
        networks:
          - internal

    web:
        restart: unless-stopped
        image: dqms-gitlab.wistron.com:5000/tqms/bam/gb04_opex/web/${TAG} # 新增這行
        build:
          context: .
          dockerfile: ./deploy/Dockerfile.web
        args:
          - ENV=.env
        container_name: ${DOCKER_WEB_CONTAINER}
        ports:
          - ${DOCKER_WEB_PORT}:${DOCKER_SSL_DEFAULT_PORT}
        volumes:
          - ./deploy/nginx.conf:/nginx.conf.template
          - ./deploy/uwsgi_params:/etc/nginx/uwsgi_params
          - ${DOCKER_CERTIFICATE_PATH}:/cert
        environment:
          NGINX_APP_CONTAINER: ${DOCKER_APP_CONTAINER}
          NGINX_UWSGI_INTERNAL_PORT: ${DOCKER_UWSGI_INTERNAL_PORT}
          NGINX_DAPHNE_CONTAINER: ${DOCKER_DAPHNE_CONTAINER}
          NGINX_DAPHNE_PORT: ${DOCKER_DAPHNE_PORT}
          NGINX_DOMAIN: ${DOCKER_WEB_DOMAIN}
          NGINX_WEB_HOST: ${DOCKER_WEB_HOST}
          NGINX_WEB_PORT: ${DOCKER_WEB_PORT}
          NGINX_SSL_DEFAULT_PORT: ${DOCKER_SSL_DEFAULT_PORT}
          NGINX_HTTP_DEFAULT_PORT: ${DOCKER_HTTP_DEFAULT_PORT}
        depends_on:
          - app
        links:
          - app
        networks:
          - internal

    db:
        image: postgres:16-bullseye
        restart: always
        container_name: ${DOCKER_DB_CONTAINER}
        volumes:
          - ./db/postgresql:/var/lib/postgresql/data/
        ports:
          - "${DOCKER_DB_PORT}:${DOCKER_DB_INNER_PORT}"
        environment:
          POSTGRES_USER: ${DOCKER_DB_USER}
          POSTGRES_PASSWORD: ${DOCKER_DB_PASSWORD}
          POSTGRES_DB: ${DOCKER_DB_DATABASE}
        env_file: ./.env
        networks:
          - internal

    redis:
        image: redis:5.0
        container_name: ${DOCKER_REDIS_CONTAINER}
        restart: always
        command: redis-server
        deploy:
          resources:
            limits:
            cpus: '2'
        networks:
          - internal

    daphne:
        <<: *django
        container_name: ${DOCKER_DAPHNE_CONTAINER}
        command: bash -c "daphne -b 0.0.0.0 -p ${DOCKER_DAPHNE_PORT} core.asgi:application"
        depends_on:
          - redis
        links:
          - redis
        networks:
          - internal

    networks:
    internal:
        name: gb04_opex

    volumes:
    staticfiles:
    log:
    ```

8.  如果選擇手動 ssh 連線到 QAS 或是 PRD 進行佈署，連線到相應的伺服器並切換到相應的資料夾之後，記得確認一下資料夾底下的.env 是否正確(至少要包含`CI_REGISTRY_USER`和`CI_REGISTRY_PASSWORD`，否則可能會跳出 docker auth error)

    ```shell
    sudo sh docker-deploy.sh -t qas # 啟動QAS
    sudo sh docker-deploy.sh -t prd # 啟動PRD
    ```

9.  如果選擇使用 CD 在 gitlab 上進行佈署的話，請先確認.gitlab-ci.yml 是否有這兩個階段，
    請詳細閱讀以下 script，自行修改進去的 directory 和 pull 的 image 的路徑
    ，接著就是在合併完分支後找到這一個階段然後佈署就可以了。

        ```yaml
        QAS-deploy:
        image: docker
        stage: Deploy
        only:
            - /^release-v[0-9]+(?:.[0-9]+)+$/
        before_script:
            - echo -n $CI_REGISTRY_PASSWORD | docker login --username $CI_REGISTRY_USER --password-stdin $CI_REGISTRY
        script:
            - echo https://$CI_REGISTRY_USER:$CI_REGISTRY_PASSWORD@$CI_SERVER_HOST/$CI_PROJECT_PATH.git
            - apk add sshpass
            - sshpass -p $QAS_PASS ssh -t -t -o StrictHostKeyChecking=no dqms-qas@10.32.48.85
            "cd ~/GB04_OPEX/gb04_opex && echo $QAS_PASS | sudo -S sudo sh docker-deploy.sh -t qas"
        when: manual

        PRD-deploy:
        image: docker
        stage: Deploy
        only:
            - main
        before_script:
            - echo -n $CI_REGISTRY_PASSWORD | docker login --username $CI_REGISTRY_USER --password-stdin $CI_REGISTRY
        script:
            - apk add sshpass
            - sshpass -p $PRD_PASS ssh -t -t -o StrictHostKeyChecking=no dqms-admin@10.32.48.245
            "cd ~/GB04_OPEX/gb04_opex && echo $QAS_PASS | sudo -S sudo sh docker-deploy.sh -t prd"
        when: manual
        ```

## BAM 系統資料關係

[BAM 系統資料關係圖](https://wistron-my.sharepoint.com/:u:/r/personal/leo_tu_wistron_com/Documents/BAM/%E5%90%84%E7%B3%BB%E7%B5%B1%E5%AF%A6%E9%AB%94%E9%97%9C%E4%BF%82/BAM_ERD.drawio?csf=1&web=1&e=DgoQuP)

![BAM系統資料關係圖](./images/BAM%20系統關係圖.jpg)

## VM 資源清理

如果遇到 VM 資源不足的情況，可以透過 top 方式查看目前系統資源使用情況，並透過 free 指令來指令來清理記憶體資源(請記得只在自己的 VM 上使用，不要在其他機器或伺服器上使用)。

```shell
top
```

![top_範例](./images/top_範例.png)

```shell
free -h && sudo sysctl -w vm.drop_caches=3 && sudo sync && echo 3 | sudo tee /proc/sys/vm/drop_caches && free -h
```

![free_範例](./images/free_範例.png)


## BAM 版號及分支管理
### 分支規則與流程
1. 分支定義：
    - develop 分支：用於中大型功能的開發。
    - release 分支：用於測試階段，將開發完成的功能整合進來進行穩定性測試。
    - main 分支：代表生產環境中的穩定版本。
2. 開發流程：
    - 中大型開發任務開始於 develop 分支。
    - develop 分支開發完成後，合併至 release 分支開始測試（版本號開始為 v2.0.0rc0）。
    - 測試期間的修正和改進版本號依次遞增，如 v2.0.0rc1、v2.0.0rc2 等。
    - 測試穩定後，將 release 分支合併到 main 分支，發布至生產環境（如 v2.0.0 正式版）。
3. Hotfix 流程：
    - 在生產環境（main 分支）中發現的小問題需進行 hotfix，直接於 main 分支上修正，並增版號後（如 v2.0.1）。
4. 新開發流程：
    - 開始新的中小型開發，從 main 分支合併回 develop 分支，或從 main 開一個新的 develop 分支繼續進行（計畫中小型改動，版本號如 v2.1.0）。
    - 發布過程中，依然在 release 中進行測試，使用 v2.1.0rc0、v2.1.0rc1 等候選版本號，直到達到穩定並合併回 main 發布正式版 v2.1.0。
5. 大型改動：
    - 若涉及重大功能或結構性變更，設定為新主版本，如 v3.0.0，依相同過程進行。
### 情景分析
#### 當前情境： 假設當前版本為 v2.0.0，流程開始如下：
- 開發階段：
    - 在 develop 分支上開發新的功能。當開發達到一定程度，功能已完成，準備進行測試。
- 測試階段：
    - 合併 develop 分支到 release 分支，進入測試階段。
    - 在測試中，識別並修正所有問題，此階段版本號為 v2.0.0rcX，並進行迭代，直到版本穩定。
- 發布階段：
    - 測試達到穩定狀態後，將 release 分支合併到 main 分支，發布 v2.0.0 正式版本。
- 修正與新開發：
    - 如遇小問題（bug），在 main 分支上執行 hotfix，並發布 v2.0.X 版本。
    - 如需進行新的中小型開發任務，從 main 分支更新至 develop 分支，繼續新功能開發（如 v2.1.0）。
