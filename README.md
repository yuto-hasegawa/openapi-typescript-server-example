# openapi-typescript-server-example

## App

```sh
npm start
```

to run the sample.

```sh
curl localhost:3000/hello?name=Taro
```

or

```sh
cd requests
sh hello.sh
sh dates.sh
...
```

to run sample requests.

## Code Generation

Code generation is configured in [openapi](/openapi/) directory.

run

```sh
npm run generate
```

to run openapi-generator-cli.

There are also pre-generated codes in [src/generated](/src/genereted/) .
