import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('parse_guides', Path(__file__).resolve().parents[1] / 'curricula/up-hindi-2026/tools/parse_guides.py')
parse = importlib.util.module_from_spec(spec)
spec.loader.exec_module(parse)


class GridAttachmentTests(unittest.TestCase):
    """Two-column period bands: 3.1 (left) and 3.2 (right) overlap vertically (TG G2 PDF p123)."""

    def day(self):
        step = lambda num, col, top, bottom: {'num': num, 'col': col, 'pdfPage': 123, 'top': top, 'bottom': bottom}
        return {'periods': [{'steps': [step('3.1', 'L', .69, .93), step('3.2', 'R', .61, .83)]}]}

    def test_right_column_grid_goes_to_the_right_column_step(self):
        day = self.day()
        parse.attach_grids(day, [(123, {'grids': [[.82, .67, .94, .77]]})])
        s31, s32 = day['periods'][0]['steps']
        self.assertNotIn('grids', s31)
        self.assertEqual(s32['grids'], [[.82, .67, .94, .77]])

    def test_left_column_grid_stays_left(self):
        day = self.day()
        parse.attach_grids(day, [(123, {'grids': [[.1, .75, .3, .85]]})])
        self.assertIn('grids', day['periods'][0]['steps'][0])

    def test_steps_without_a_column_still_get_grids(self):
        day = {'periods': [{'steps': [{'num': '1.1', 'pdfPage': 5, 'top': .2, 'bottom': .4}]}]}
        parse.attach_grids(day, [(5, {'grids': [[.7, .25, .9, .35]]})])
        self.assertIn('grids', day['periods'][0]['steps'][0])


if __name__ == '__main__':
    unittest.main()
