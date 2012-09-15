window.plugins.socktest =
  bind: (div, item) ->
  emit: (div, item) ->
    wiki.getScript 'http://cdn.sockjs.org/sockjs-0.3.min.js', ->
      div.append("""
          <style>
            .socktest .box {
                width: 300px;
                float: left;
                margin: 0 20px 0 20px;
            }
            .socktest .box div, .socktest .box input {
                border: 1px solid;
                -moz-border-radius: 4px;
                border-radius: 4px;
                width: 100%;
                padding: 0px;
                margin: 5px;
            }
            .socktest .box div {
                border-color: grey;
                height: 300px;
                overflow: auto;
            }
            .socktest .box input {
                height: 30px;
            }
          </style>

          <div id="first" class="box">
            <div></div>
            <form><input autocomplete="off" value="Type here..."></input></form>
          </div>                  """)

      sockjs_url = "/system/echo"
      sockjs = new SockJS(sockjs_url)
      $("#first input").focus()
      div = $("#first div")
      inp = $("#first input")
      form = $("#first form")
      print = (m, p) ->
        p = (if (p is `undefined`) then "" else JSON.stringify(p))
        div.append $("<code>").text(m + " " + p)
        div.append $("<br>")
        div.scrollTop div.scrollTop() + 10000

      sockjs.onopen = ->
        print "[*] open", sockjs.protocol

      sockjs.onmessage = (e) ->
        print "[.] message", e.data

      sockjs.onclose = ->
        print "[*] close"

      form.submit ->
        print "[ ] sending", inp.val()
        sockjs.send inp.val()
        inp.val ""
        false
