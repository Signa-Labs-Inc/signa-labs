from solution import two_sum


def test_basic_case():
    assert two_sum([2, 7, 11, 15], 9) == [0, 1]


def test_middle_elements():
    assert two_sum([3, 2, 4], 6) == [1, 2]
