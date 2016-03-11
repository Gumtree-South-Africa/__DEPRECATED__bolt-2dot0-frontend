# CORS 

CORS is a module that 
    1) prevents outside users using Bolt API by cross site scripting
    2) enabling developers within ECG orgnazation to use cross site scripting

### Usage

```javascript
var cors = require(process.cwd() + "/modules/cors");

router.get('/api/ads/gallery', cors, function (req, res) ....
```

### Testing

In this version we are only concern with outside users trying to exploit our API endpoints. 

#### case 1 (when ajax request is originated from our the javascript file that was servered by our domain)

In order to test this do the following from command  prompt:

```javscript
    curl -H "Origin: http://www.vivanuncios.com.mx" --verbose \
    http://www.vivanuncios.com.mx.localhost:8000/api/ads/gallery\?offset\=1\&limit\=16
```

#### Request headers
```
*   Trying 127.0.0.1...
* Connected to www.vivanuncios.com.mx.localhost (127.0.0.1) port 8000 (#0)
> GET /api/ads/gallery?offset=1&limit=16 HTTP/1.1
> Host: www.vivanuncios.com.mx.localhost:8000
> User-Agent: curl/7.43.0
> Accept: */*
> Origin: http://www.vivanuncios.com.mx
>

```

Please note in above request headers you will notice "Origin" header, which says request is originating from source that was servered by http://www.vivanuncios.com.mx

```
Origin: http://www.vivanuncios.com.mx
```

#### Response headers
```
< HTTP/1.1 200 OK
< X-Powered-By: Bolt 2.0
< Access-Control-Allow-Origin: http://www.vivanuncios.com.mx
< Vary: Origin, Accept-Encoding
< Content-Type: application/json; charset=utf-8
< Content-Length: 1080
< ETag: W/"438-9j9YcqqeSfR6L017gMbGJg"
< Date: Fri, 11 Mar 2016 19:10:19 GMT
< Connection: keep-alive
```

In response headers you should see 
>Access-Control-Allow-Origin: http://www.vivanuncios.com.mx

#### case 2 (when ajax request is NOT originated from our javascript file that was not servered by our domain)

In order to test this do the following from command  prompt:

```javscript
    curl -H "Origin: http://www.yourmama.com" --verbose \
    http://www.vivanuncios.com.mx.localhost:8000/api/ads/gallery\?offset\=1\&limit\=16
```

#### Request headers
```
*   Trying 127.0.0.1...
* Connected to www.vivanuncios.com.mx.localhost (127.0.0.1) port 8000 (#0)
> GET /api/ads/gallery?offset=1&limit=16 HTTP/1.1
> Host: www.vivanuncios.com.mx.localhost:8000
> User-Agent: curl/7.43.0
> Accept: */*
> Origin: http://www.yourmama.com
>

```

Please note in above request headers you will notice "Origin" header, which says request is originating from source that was servered by http://www.yourmama.com


```
Origin: http://www.vivanuncios.com.mx
```

#### Response headers
```
< HTTP/1.1 200 OK
< X-Powered-By: Bolt 2.0
< Content-Type: application/json; charset=utf-8
< Content-Length: 1080
< ETag: W/"438-9j9YcqqeSfR6L017gMbGJg"
< Vary: Accept-Encoding
< Date: Fri, 11 Mar 2016 19:42:59 GMT
< Connection: keep-alive
```

In response headers you should see 
>Access-Control-Allow-Origin: http://www.vivanuncios.com.mx


## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Anton Ganeshalingam** - *Initial work* 



## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments


