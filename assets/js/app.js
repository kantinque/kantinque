// Smooth scroll untuk anchor
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        var targetId = this.getAttribute('href');
        if (targetId.length > 1) {
            e.preventDefault();
            document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Animasi angka skor dan hitung rata-rata
(function() {
    var values = Array.from(document.querySelectorAll('.score .value'));
    if (!values.length) return;

    function toNumber(text) {
        // menerima format 4,6/5 atau 4.6/5
        var base = text.split('/')[0].trim().replace(',', '.');
        return parseFloat(base);
    }

    var total = values.reduce(function(sum, el) { return sum + (parseFloat(el.dataset.score) || toNumber(el.textContent)); }, 0);
    var avg = (total / values.length).toFixed(1).replace('.', ',');
    var avgEl = document.getElementById('avg-score');
    if (avgEl) avgEl.textContent = avg;

    // animasi count-up
    values.forEach(function(el) {
        var target = parseFloat(el.dataset.score);
        if (!isFinite(target)) return;
        var start = 0;
        var duration = 900; // ms
        var startTime = null;

        function step(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            var current = (start + (target - start) * progress).toFixed(1).replace('.', ',');
            el.textContent = current + '/5';
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    });
})();

// Footer year
(function() {
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
})();

// Keranjang & Checkout dummy + Modal QRIS
(function() {
    var cart = [];
    var cartTbody = document.getElementById('cart-items');
    var subtotalEl = document.getElementById('subtotal');
    var taxEl = document.getElementById('tax');
    var grandEl = document.getElementById('grand-total');
    var payBtn = document.getElementById('pay-qris');

    function formatRupiah(n) {
        var s = (n || 0).toLocaleString('id-ID');
        return 'Rp' + s;
    }

    function findIndexByName(name) {
        for (var i = 0; i < cart.length; i++)
            if (cart[i].name === name) return i;
        return -1;
    }

    function render() {
        if (!cartTbody) return;
        cartTbody.innerHTML = '';
        var subtotal = 0;
        cart.forEach(function(item) {
            var row = document.createElement('tr');
            var total = item.qty * item.price;
            subtotal += total;
            row.innerHTML = '<td>' + item.name + '</td>' +
                '<td><div class="qty-controls">' +
                '<button class="qty-btn" data-action="dec" data-name="' + item.name + '">-</button>' +
                '<span>' + item.qty + '</span>' +
                '<button class="qty-btn" data-action="inc" data-name="' + item.name + '">+</button>' +
                '</div></td>' +
                '<td>' + formatRupiah(item.price) + '</td>' +
                '<td>' + formatRupiah(total) + '</td>' +
                '<td><button class="qty-btn" data-action="remove" data-name="' + item.name + '">×</button></td>';
            cartTbody.appendChild(row);
        });
        var tax = Math.round(subtotal * 0.10);
        var grand = subtotal + tax;
        if (subtotalEl) subtotalEl.textContent = formatRupiah(subtotal);
        if (taxEl) taxEl.textContent = formatRupiah(tax);
        if (grandEl) grandEl.textContent = formatRupiah(grand);
        if (payBtn) payBtn.disabled = grand === 0;
    }

    // Tambah dari section Menu
    document.querySelectorAll('.add-item').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var name = this.dataset.name;
            var price = parseInt(this.dataset.price, 10) || 0;
            var idx = findIndexByName(name);
            if (idx === -1) cart.push({ name: name, price: price, qty: 1 });
            else cart[idx].qty += 1;
            render();
            document.querySelector('#checkout').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Delegasi tombol qty/remove
    if (cartTbody) cartTbody.addEventListener('click', function(e) {
        var t = e.target;
        if (!t.matches('.qty-btn')) return;
        var name = t.getAttribute('data-name');
        var action = t.getAttribute('data-action');
        var idx = findIndexByName(name);
        if (idx === -1) return;
        if (action === 'inc') cart[idx].qty += 1;
        if (action === 'dec') cart[idx].qty = Math.max(0, cart[idx].qty - 1);
        if (action === 'remove' || cart[idx].qty === 0) cart.splice(idx, 1);
        render();
    });

    // Modal QRIS
    var modal = document.getElementById('qris-modal');

    function openModal() {
        if (modal) {
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
        }
    }
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'pay-qris') {
            e.preventDefault();
            openModal();
        }
        if (e.target && e.target.hasAttribute('data-close')) { closeModal(); }
    });

    render();
})();

// Rating bintang + Cetak struk
(function() {
    // Rating
    var starsWrap = document.getElementById('rating-stars');
    var avgEl = document.getElementById('rating-avg');
    var countEl = document.getElementById('rating-count');
    var hintEl = document.getElementById('rating-hint');
    var ratings = [];
    var feedbackInput = document.getElementById('feedback-text');
    var feedbackList = document.getElementById('feedback-list');
    var feedbackBtn = document.getElementById('submit-feedback');
    var feedbacks = [];

    function updateSummary() {
        var sum = ratings.reduce(function(s, n) { return s + n; }, 0);
        var avg = ratings.length ? (sum / ratings.length).toFixed(1) : '0.0';
        if (avgEl) avgEl.textContent = avg;
        if (countEl) countEl.textContent = '(' + ratings.length + ' penilaian)';
    }
    // Preload rating dari detail penilaian preset
    (function preloadPreset() {
        var preset = [4.6, 4.8, 4.4, 4.7];
        ratings = ratings.concat(preset);
        updateSummary();
    })();

    if (starsWrap) {
        starsWrap.addEventListener('mouseover', function(e) {
            if (!e.target.matches('.star')) return;
            var v = parseInt(e.target.dataset.value, 10);
            starsWrap.querySelectorAll('.star').forEach(function(s, i) { s.classList.toggle('hovered', i < v); });
        });
        starsWrap.addEventListener('mouseleave', function() {
            starsWrap.querySelectorAll('.star').forEach(function(s) { s.classList.remove('hovered'); });
        });
        // Tidak langsung menambahkan rating saat klik; simpan sementara
        var pendingRating = 0;
        starsWrap.addEventListener('click', function(e) {
            if (!e.target.matches('.star')) return;
            pendingRating = parseInt(e.target.dataset.value, 10) || 0;
            if (hintEl) hintEl.textContent = 'Rating dipilih: ' + pendingRating + ' bintang. Tambahkan masukan lalu klik Kirim.';
            starsWrap.querySelectorAll('.star').forEach(function(s, i) { s.classList.toggle('active', i < pendingRating); });
        });

        // Submit feedback akan memasukkan rating + masukan ke penilaian
        if (feedbackBtn && feedbackInput) {
            feedbackBtn.addEventListener('click', function() {
                var text = (feedbackInput.value || '').trim();
                if (!pendingRating) { if (hintEl) hintEl.textContent = 'Pilih rating bintang terlebih dahulu.'; return; }
                if (!text) { if (hintEl) hintEl.textContent = 'Tulis masukan terlebih dahulu.'; return; }
                ratings.push(pendingRating);
                feedbacks.push(text);
                feedbackInput.value = '';
                pendingRating = 0;
                renderFeedback();
                updateSummary();
                if (hintEl) hintEl.textContent = 'Terima kasih! Rating dan masukan Anda tercatat.';
                // reset tampilan bintang
                starsWrap.querySelectorAll('.star').forEach(function(s) { s.classList.remove('active');
                    s.classList.remove('hovered'); });
            });
        }
    }

    // Simpan masukan
    function renderFeedback() {
        if (!feedbackList) return;
        feedbackList.innerHTML = '';
        feedbacks.slice().reverse().forEach(function(text) {
            var li = document.createElement('li');
            li.textContent = text;
            feedbackList.appendChild(li);
        });
    }

    if (feedbackBtn && feedbackInput) {
        feedbackBtn.addEventListener('click', function() {
            var text = (feedbackInput.value || '').trim();
            if (!text) { if (hintEl) hintEl.textContent = 'Tulis masukan terlebih dahulu.'; return; }
            feedbacks.push(text);
            feedbackInput.value = '';
            renderFeedback();
            if (hintEl) hintEl.textContent = 'Terima kasih atas masukannya!';
        });
    }

    // Cetak struk setelah pembayaran
    var finishBtn = document.getElementById('finish-payment');
    if (finishBtn) {
        finishBtn.addEventListener('click', function() {
            // Ambil ringkasan keranjang dari tabel checkout
            var tbody = document.getElementById('cart-items');
            var rows = tbody ? Array.from(tbody.querySelectorAll('tr')) : [];
            var receipt = document.getElementById('receipt');
            var receiptItems = document.getElementById('receipt-items');
            var grand = document.getElementById('grand-total');
            var dateEl = document.getElementById('receipt-date');
            var totalEl = document.getElementById('receipt-total');
            if (receipt && receiptItems) {
                // isi tabel sederhana: Item | Qty | Total
                receiptItems.innerHTML = '<thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead><tbody></tbody>';
                var tb = receiptItems.querySelector('tbody');
                rows.forEach(function(r) {
                    var tds = r.querySelectorAll('td');
                    if (tds.length >= 4) {
                        var name = tds[0].textContent.trim();
                        var qty = tds[1].querySelector('span') ? tds[1].querySelector('span').textContent.trim() : '1';
                        var total = tds[3].textContent.trim();
                        var tr = document.createElement('tr');
                        tr.innerHTML = '<td>' + name + '</td><td>' + qty + '</td><td>' + total + '</td>';
                        tb.appendChild(tr);
                    }
                });
                if (dateEl) dateEl.textContent = new Date().toLocaleString('id-ID');
                if (totalEl && grand) totalEl.textContent = grand.textContent;
                // tampilkan template struk lalu cetak
                receipt.style.display = 'block';
                window.setTimeout(function() { window.print(); }, 100);
            }
            // Tutup modal
            var modal = document.getElementById('qris-modal');
            if (modal) {
                modal.classList.remove('open');
                modal.setAttribute('aria-hidden', 'true');
            }
        });
    }
})();