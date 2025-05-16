fetch('./boligprisstatistikk.json')
    .then(respone => respone.json())
    .then(data => {
        const feltVelger = document.getElementById('felt');
        const chart = document.getElementById('chart');
        const stedListe = document.getElementById('sted-liste');

        function tegnGraf(felt) {
            chart.innerHTML = '';
            stedListe.innerHTML = '';
            const steder = Object.keys(data);
            const verdier = steder.map(sted => {
                const verdi = data[sted][felt];
                return typeof verdi === 'string'
                ? parseFloat(verdi.replace(/[^\d.-]/g, ''))
                : verdi;
            });
        
        const maxAbs = Math.max(...verdier.map(v => Math.abs(v)));
        const barHeight = 20;
        const spacing = 10;
        const offsetY = 20;
        const grafBredde = 285;
        const harNegative = verdier.some(v => v < 0);
        const nullpunktx = harNegative ? 250 : 120;

        chart.innerHTML = harNegative
        ? `<line x1="${nullpunktx}" y1="15" x2="${nullpunktx}" y2="225" stroke="#ccc" stroke-width="1"/>`
        : `<line x1="${nullpunktx}" y1="15" x2="${nullpunktx}" y2="225" stroke="#ccc" stroke-width="1"/>`;

        const antallSteg = 5;
        const steg = maxAbs / antallSteg;

        for (let i = -antallSteg; i <= antallSteg; i++) {
            const verdi = steg * i;
            if (!harNegative && verdi < 0) continue;

            const pos = nullpunktx + (verdi / maxAbs) * (grafBredde / (harNegative ? 2 : 1));
            
            chart.innerHTML += `
            <text x="${pos}" y="240" font-size="8" fill="#666" text-anchor="middle">
            ${Math.round(verdi).toLocaleString('no-NO')}</text>
            <line x1="${pos}" y1="228" x2="${pos}" y2="222" stroke="#999" stroke-width="1"/>
            `;

            chart.innerHTML += `
            <line x1="${nullpunktx - (harNegative ? grafBredde / 2 : 0)}" y1="225" x2="${nullpunktx + grafBredde / (harNegative ? 2 : 1)}"
            y2="225" stroke="#ccc" stroke-width="1"/>
            `;
        }


        steder.forEach((sted, i) => {
            const verdi = verdier[i];
            const skalertVerdi = (verdi / maxAbs) * (grafBredde / (harNegative ? 2 : 1)) ;
            const bredde = Math.abs(skalertVerdi);
            const y = offsetY + i * (barHeight + spacing);
            const x = nullpunktx + (verdi < 0 ? skalertVerdi : 0);
            const farge = verdi >= 0 ? '#4CAF50' : '#F44336';
            const tekstX = verdi >= 0 ? x + bredde - 5 : x + 5;
            const tekstAnchor = verdi >= 0 ? 'end' : 'start';

            chart.innerHTML += `
            
                <rect x="${x}" y="${y}" width="${bredde}" height="${barHeight}" fill="${farge}" rx="4" ry="4"
                    data-sted="${sted}" class="bar">
                    <title>${sted}: ${verdi}</title>
                </rect>
                <text x="${tekstX}" y="${y + barHeight / 1.5}" text-anchor="${tekstAnchor}" class="stolpe-verdi">
                ${felt === 'Endring hittil i år' ? verdi.toFixed(1) + '%' : verdi.toFixed(1)}
                </text>
                <text x="5" y="${y + barHeight / 1.5}" font-size="10" fill="#555" text-decoration="">${sted}</text>
            `;
        });

        
        let første = true;

        Object.keys(data).forEach(sted => {
            const label = document.createElement('label');
            label.className = 'sted-valg';
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'sted';
            radio.value = sted;

            if (første) {
                radio.checked = true;
                visDetaljer(sted);
                første = false;
            }

            radio.addEventListener('change', () => {
                if (radio.checked) visDetaljer(sted);
            });
                       label.appendChild(radio);
            label.appendChild(document.createTextNode(sted));
            stedListe.appendChild(label);

            });

            chart.addEventListener('click', e => {
                if (e.target.classList.contains('bar')) {
                    const valgtSted = e.target.dataset.sted;
                    const radio = document.querySelector(`input[name="sted"][value="${valgtSted}"]`);
                    if (radio) {
                        radio.checked = true;
                        visDetaljer(valgtSted);
                    }
                };
            });
 


        visDetaljer(steder[0]);
        }

        function visDetaljer(sted) {
            const info = data[sted];
            const detaljer = document.getElementById('detaljer');

            let html = `<table>`;
            html += `<thead><tr><th colspan= "2">${sted}</th></tr></thead>`;
            html += `<tbody>`;

            for (const [nøkkel, verdi] of Object.entries(info)) {
                html += `
                <tr>
                <th>${nøkkel}</th>
                <td>${verdi}</td>
                </tr>`;
            }
            html += `</tbody></table>`;
            detaljer.innerHTML = html;
        }

        feltVelger.addEventListener('change', () => {
            tegnGraf(feltVelger.value);
        });

        tegnGraf(feltVelger.value);
        
    })

    .catch(err => {
        console.error('Feil ved henting:', err)
    });


