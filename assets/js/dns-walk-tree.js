(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var root = document.querySelector('.dns-walk');
    if (!root) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var STEPS = [
      {
        no: 'Step 1 of 4', path: 'dns-walk-p-client', node: 'dns-walk-n-client', hop: null,
        verdict: 'handed off', vclass: 'v-idle', tone: 'query',
        who: 'Chrome → your resolver', q: 'roeiam.online.  A',
        an: '—', au: '—', ad: '—', fl: 'rd',
        means: 'Chrome does almost none of this. The OS stub resolver sets <b>RD</b> — recursion desired — hands the name to whichever resolver DHCP handed you, and waits. Every query below is sent by that resolver, not by your machine.',
        repro: 'dig roeiam.online'
      },
      {
        no: 'Step 2 of 4', path: 'dns-walk-p-root', node: 'dns-walk-n-root', hop: 'dns-walk-lbl-root',
        verdict: 'referral', vclass: 'v-ref', tone: 'referral',
        who: 'Resolver → a.root-servers.net', q: 'roeiam.online.  A',
        an: '0', au: '4', ad: '0', fl: 'qr',
        means: 'Zero answers. The root has never heard of <b>roeiam.online</b> — it holds TLDs and nothing under them. So it matches the deepest label it does hold, <b>online</b>, and returns that delegation: four nameservers. No <b>aa</b>, and no recursion on offer — a root server answers out of its own zone or not at all. It did not forward anything; the reply came straight back to the resolver.',
        repro: 'dig @a.root-servers.net roeiam.online'
      },
      {
        no: 'Step 3 of 4', path: 'dns-walk-p-tld', node: 'dns-walk-n-tld', hop: 'dns-walk-lbl-tld',
        verdict: 'referral', vclass: 'v-ref', tone: 'referral',
        who: 'Resolver → ns01.trs-dns.net', q: 'roeiam.online.  A',
        an: '0', au: '2', ad: '0', fl: 'qr',
        means: 'Zero again. The <b>.online</b> registry knows the delegation exists and who runs it — <b>ns11</b> and <b>ns12.domaincontrol.com</b> — but holds none of the zone\'s records. ADDITIONAL is empty because both nameservers live in <b>.com</b>, outside the zone being delegated, so no glue can ship with this referral. The resolver has to resolve those two names on its own before it can ask them anything.',
        repro: 'dig @ns01.trs-dns.net roeiam.online'
      },
      {
        no: 'Step 4 of 4', path: 'dns-walk-p-auth', node: 'dns-walk-n-auth', hop: 'dns-walk-lbl-auth',
        verdict: 'answer', vclass: 'v-ans', tone: 'answer',
        who: 'Resolver → ns11.domaincontrol.com', q: 'roeiam.online.  A',
        an: '4', au: '2', ad: '0', fl: 'qr aa',
        means: '<b>aa</b> appears for the first time. This server holds the zone, so it answers out of its own data instead of pointing further down: four A records, TTL 600, pointing at GitHub Pages. The resolver caches them and hands the addresses back to Chrome — which only now opens a connection. DNS is finished. (Counts exclude the EDNS OPT pseudo-record.)',
        repro: 'dig @ns11.domaincontrol.com roeiam.online A'
      }
    ];

    var svg = root.querySelector('svg');
    var packet = document.getElementById('dns-walk-packet');
    var readout = document.getElementById('dns-walk-readout');

    function $(id) { return document.getElementById(id); }

    var i = -1;
    var playing = false;
    var anim = null;
    var timer = null;

    function toneColor(tone) {
      if (tone === 'answer') return 'var(--cmd-truth)';
      if (tone === 'referral') return 'var(--cmd-cache)';
      return 'var(--accent)';
    }

    function setPacketTone(tone) {
      var c = toneColor(tone);
      packet.querySelectorAll('circle').forEach(function (el) {
        el.setAttribute('fill', c);
      });
    }

    function ease(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function travel(pathId, tone, cb) {
      if (anim) cancelAnimationFrame(anim);
      var path = $(pathId);
      var len = path.getTotalLength();
      if (reduce) {
        packet.setAttribute('opacity', '0');
        if (cb) cb();
        return;
      }
      packet.setAttribute('opacity', '1');
      var OUT = 620;
      var BACK = 620;
      var HOLD = 180;
      var total = OUT + HOLD + BACK;
      var t0 = performance.now();

      function frame(now) {
        var t = now - t0;
        var d;
        var tone2 = 'query';
        if (t < OUT) d = len * ease(t / OUT);
        else if (t < OUT + HOLD) { d = len; tone2 = 'query'; }
        else if (t < total) {
          d = len * (1 - ease((t - OUT - HOLD) / BACK));
          tone2 = tone;
        } else {
          packet.setAttribute('opacity', '0');
          if (cb) cb();
          return;
        }
        setPacketTone(t >= OUT + HOLD ? tone2 : 'query');
        var pt = path.getPointAtLength(d);
        packet.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ')');
        anim = requestAnimationFrame(frame);
      }
      anim = requestAnimationFrame(frame);
    }

    function idleHtml() {
      return '<span class="who">nothing sent yet</span>Press <b>Start</b> — or click any server in the diagram';
    }

    function render() {
      svg.querySelectorAll('.edge').forEach(function (e) {
        e.classList.remove('on');
        e.style.stroke = '';
      });
      svg.querySelectorAll('.node').forEach(function (n) { n.classList.add('dim'); });
      svg.querySelectorAll('.t-hop').forEach(function (h) { h.style.fill = ''; });
      $('dns-walk-n-resolver').classList.remove('dim');

      if (i < 0) {
        svg.querySelectorAll('.node').forEach(function (n) { n.classList.remove('dim'); });
        $('dns-walk-step-no').textContent = 'Step 0 of 4';
        $('dns-walk-verdict').textContent = 'not started';
        $('dns-walk-verdict').className = 'dns-walk__verdict v-idle';
        $('dns-walk-cmd').innerHTML = idleHtml();
        $('dns-walk-repro').innerHTML = '';
        ['dns-walk-m-an', 'dns-walk-m-au', 'dns-walk-m-ad', 'dns-walk-m-fl'].forEach(function (id) {
          $(id).textContent = '—';
        });
        $('dns-walk-m-an').style.color = '';
        $('dns-walk-means').innerHTML = 'Four queries, one answer. Step through to see which server actually hands over an address — and how many only point somewhere else.';
        $('dns-walk-btn-next').textContent = 'Start →';
        $('dns-walk-btn-prev').disabled = true;
        $('dns-walk-btn-next').disabled = false;
        $('dns-walk-btn-play').textContent = 'Play all';
        $('dns-walk-btn-play').classList.remove('primary');
        return;
      }

      var s = STEPS[i];
      var edge = $(s.path);
      edge.classList.add('on');
      edge.style.stroke = toneColor(s.tone);
      $(s.node).classList.remove('dim');
      if (s.hop) $(s.hop).style.fill = edge.style.stroke;

      $('dns-walk-step-no').textContent = s.no;
      $('dns-walk-verdict').textContent = s.verdict;
      $('dns-walk-verdict').className = 'dns-walk__verdict ' + s.vclass;
      $('dns-walk-cmd').innerHTML = '<span class="who">' + s.who + '</span>' + s.q;
      $('dns-walk-repro').innerHTML = '<span>reproduce by hand</span><code>' + s.repro + '</code>';
      $('dns-walk-m-an').textContent = s.an;
      $('dns-walk-m-au').textContent = s.au;
      $('dns-walk-m-ad').textContent = s.ad;
      $('dns-walk-m-fl').textContent = s.fl;
      $('dns-walk-means').innerHTML = s.means;
      $('dns-walk-m-an').style.color = (s.an !== '0' && s.an !== '—') ? 'var(--cmd-truth)' : '';

      $('dns-walk-btn-prev').disabled = false;
      $('dns-walk-btn-next').disabled = i >= STEPS.length - 1;
      $('dns-walk-btn-next').textContent = i >= STEPS.length - 1 ? 'Done' : 'Next →';
    }

    function stopPlay() {
      playing = false;
      clearTimeout(timer);
      $('dns-walk-btn-play').textContent = 'Play all';
      $('dns-walk-btn-play').classList.remove('primary');
    }

    function onArrive() {
      if (!playing) return;
      if (i >= STEPS.length - 1) {
        stopPlay();
        return;
      }
      timer = setTimeout(function () { go(i + 1, true); }, 420);
    }

    function go(n, animate) {
      i = Math.max(-1, Math.min(STEPS.length - 1, n));
      render();
      if (animate && i >= 0) travel(STEPS[i].path, STEPS[i].tone, onArrive);
      else onArrive();
    }

    $('dns-walk-btn-next').addEventListener('click', function () {
      stopPlay();
      go(i + 1, true);
    });
    $('dns-walk-btn-prev').addEventListener('click', function () {
      stopPlay();
      go(i - 1, true);
    });
    $('dns-walk-btn-play').addEventListener('click', function () {
      if (playing) {
        stopPlay();
        return;
      }
      playing = true;
      $('dns-walk-btn-play').textContent = 'Pause';
      $('dns-walk-btn-play').classList.add('primary');
      go(i >= STEPS.length - 1 ? 0 : i + 1, true);
    });

    var jump = {
      'dns-walk-n-client': 0,
      'dns-walk-n-root': 1,
      'dns-walk-n-tld': 2,
      'dns-walk-n-auth': 3
    };
    Object.keys(jump).forEach(function (id) {
      var el = $(id);
      el.addEventListener('click', function () {
        stopPlay();
        go(jump[id], true);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          stopPlay();
          go(jump[id], true);
        }
      });
    });

    root.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'BUTTON') return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        stopPlay();
        go(i + 1, true);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stopPlay();
        go(i - 1, true);
      }
    });

    go(-1, false);
  });
})();
