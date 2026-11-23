import asyncio, sys, base64
from playwright.async_api import async_playwright
ROOT='file:///home/claude/sf6-combo-visual/'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width':1440,'height':1100})
        errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto(ROOT+'index.html')
        n = await pg.eval_on_selector('#demoSel','e=>e.options.length')
        res=[]
        for i in range(n):
            await pg.select_option('#demoSel',str(i)); await pg.click('#demoBtn'); await pg.wait_for_timeout(80)
            res.append((await pg.inner_text('#demoCheck'))[:11])
        print(res)
        await pg.select_option('#demoSel','3'); await pg.click('#demoBtn'); await pg.wait_for_timeout(100)
        link = await pg.input_value('#shareURL')
        print('link len', len(link))
        await pg.screenshot(path='/home/claude/sf6-combo-visual/tests/shot_main.png', full_page=True)
        p2 = await b.new_page(viewport={'width':1440,'height':1100})
        p2.on('pageerror', lambda e: errs.append('p2 '+str(e)))
        await p2.goto(link); await p2.wait_for_timeout(300)
        print('desde link:', await p2.input_value('#notaTxt'), await p2.input_value('#charSel'))
        await pg.select_option('#charSel','guile'); await pg.wait_for_timeout(100)
        print('palette guile:', (await pg.inner_text('#palette'))[:200].replace('\n',' '))
        await pg.click('#schemeSeg button[data-v="modern"]'); await pg.wait_for_timeout(100)
        print('palette modern:', (await pg.inner_text('#palette'))[:200].replace('\n',' '))
        print('errors', errs)
        await b.close()
asyncio.run(main())
